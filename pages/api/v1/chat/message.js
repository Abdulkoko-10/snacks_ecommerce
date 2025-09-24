import { getAuth } from '@clerk/nextjs/server';
import { ObjectId } from 'mongodb';
import clientPromise from '../../../../lib/mongodb';
const { extractSearchIntent, generateRecommendationReasons } = require('../../../../lib/gemini');
const { searchRestaurants } = require('../../../../lib/serpapi');
const { geocodeLocation } = require('../../../../lib/location');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const dbName = process.env.MONGODB_DB_NAME || 'food-discovery';

// This function generates the simple conversational response.
async function getConversationalResponse(apiKey, chatHistory, userMessageText) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: "You are a helpful and friendly food discovery assistant. Please respond to the user in a conversational way. Keep your responses concise and focused on helping them find food.",
  });

  const history = (chatHistory || [])
    .filter(msg => msg.role === 'user' || msg.role === 'assistant')
    .map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

  const chat = model.startChat({ history });
  const result = await chat.sendMessage(userMessageText);
  return result.response.text();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Server configuration error: Missing API key.');
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  try {
    const { text: userMessageText, chatHistory, threadId: currentThreadId } = req.body;

    if (!userMessageText) {
      return res.status(400).json({ error: 'Bad Request: "text" is required.' });
    }

    let threadId = currentThreadId || new ObjectId().toString();
    const isNewThread = !currentThreadId;
    res.setHeader('X-Thread-Id', threadId);

    // --- Orchestration Logic ---
    // 1. Generate the conversational part of the response first.
    const conversationalText = await getConversationalResponse(apiKey, chatHistory, userMessageText);

    // 2. Extract structured intent from the user's message.
    const intent = await extractSearchIntent(userMessageText);

    // 3. Geocode the location to get coordinates.
    let geocode = null;
    try {
      geocode = await geocodeLocation(intent.region);
    } catch (geoError) {
      console.warn(`Geocoding failed for region "${intent.region}", proceeding without ll parameter.`);
      // Continue without geocode, SerpApi will use region string
    }

    // 4. Fetch restaurant recommendations based on the intent.
    // We'll fetch a small number for the chat interface.
    const potentialRecommendations = await searchRestaurants(intent, 5, 0, geocode);

    // 5. Generate personalized reasons for each recommendation.
    const recommendations = await Promise.all(
      potentialRecommendations.map(async (p) => {
        const reason = await generateRecommendationReasons(p, chatHistory);
        return {
          canonicalProductId: p.canonicalProductId,
          preview: {
            title: p.title,
            image: p.images && p.images.length > 0 ? p.images[0] : '/FoodDiscovery.jpg',
            rating: p.rating,
            minPrice: null, // Not available from this source
            bestProvider: "Google Maps",
            eta: "Varies",
            originSummary: ["Google Maps"],
            slug: p.placeId, // Using placeId as a slug substitute
            details: p.address,
          },
          reason: reason,
          meta: {
            generatedBy: "gemini-orchestrator",
            confidence: 0.8, // Example confidence
          }
        };
      })
    );

    // 5. Construct the final payload.
    const payload = {
      fullText: conversationalText,
      recommendations: recommendations,
    };

    res.status(200).json(payload);

    // --- Perform Database Writes After Response ---
    const saveToDb = async () => {
      try {
        const client = await clientPromise;
        const db = client.db(dbName);
        const messagesCollection = db.collection('chat_messages');
        const threadsCollection = db.collection('threads');

        if (isNewThread) {
          await threadsCollection.insertOne({
            _id: new ObjectId(threadId),
            userId,
            title: userMessageText.substring(0, 50),
            createdAt: new Date(),
            lastUpdated: new Date(),
          });
        } else {
          await threadsCollection.updateOne({ _id: new ObjectId(threadId), userId }, { $set: { lastUpdated: new Date() } });
        }

        const userMessage = { role: 'user', text: userMessageText, userId, threadId, createdAt: new Date() };
        const assistantMessage = { role: 'assistant', text: conversationalText, userId, threadId, createdAt: new Date() };

        await messagesCollection.insertMany([userMessage, assistantMessage]);
      } catch (dbError) {
        console.error("Error saving chat conversation to DB:", dbError);
      }
    };

    saveToDb();

  } catch (error) {
    console.error('Error in chat message handler:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to process chat message.' });
    }
  }
}

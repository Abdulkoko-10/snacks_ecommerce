import { getAuth } from '@clerk/nextjs/server';
import { ObjectId } from 'mongodb';
import clientPromise from '../../../../lib/mongodb';
import { readClient, urlFor } from '../../../../lib/client'; // Import Sanity client and urlFor
const { GoogleGenerativeAI } = require('@google/generative-ai');

// eslint-disable-next-line no-unused-vars
const { ChatMessage, ChatRecommendationPayload, ChatRecommendationCard } = require('../../../../schemas/chat');

const dbName = process.env.MONGODB_DB_NAME || 'food-discovery';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- Helper function for Intent Detection ---
async function getIntentAndEntity(userMessage) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `
    Analyze the user's message to determine their intent and identify any specific food items.
    Respond with a single, minified JSON object with two keys: "intent" and "entity".
    - The "intent" can be "RECOMMENDATION", "QUESTION", or "OTHER".
    - The "entity" should be the food item mentioned (e.g., "samosa", "meatpie"), normalized to be URL-friendly, or null if no specific item is found.

    User message: "${userMessage}"
  `;
  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    // Clean the response to ensure it's valid JSON
    const jsonString = responseText.replace(/```json|```/g, '').trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error getting intent from Gemini:", error);
    return { intent: "OTHER", entity: null }; // Fallback
  }
}

// --- Main Handler ---
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { text: userMessageText, chatHistory, threadId: currentThreadId } = req.body;
    if (!userMessageText) {
      return res.status(400).json({ error: 'Bad Request: "text" is required.' });
    }

    let threadId = currentThreadId || new ObjectId().toString();
    const isNewThread = !currentThreadId;

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Thread-Id', threadId);

    const { intent, entity } = await getIntentAndEntity(userMessageText);
    const targetProducts = ['samosa', 'meat-pie', 'chicken-roll']; // URL-friendly slugs

    if (intent === 'RECOMMENDATION' && entity && targetProducts.includes(entity)) {
      // --- Handle Recommendation Flow ---
      const assistantMessageId = `asst_msg_${Date.now()}`;
      const conversationalText = `Of course! Here is a recommendation for ${entity.replace('-', ' ')}:`;

      // Stream the conversational text first
      res.write(conversationalText + '\n');

      // Fetch product from Sanity
      const productQuery = `*[_type == "product" && slug.current == $slug][0]`;
      const product = await readClient.fetch(productQuery, { slug: entity });

      if (product) {
        const recommendationCard = {
          canonicalProductId: product._id,
          preview: {
            title: product.name,
            image: product.image && product.image.length > 0 ? urlFor(product.image[0]).url() : '/default-image.jpg',
            rating: product.rating || 4.5, // Mock rating if not present
            minPrice: product.price,
            bestProvider: 'FoodDiscovery',
            eta: '5-10 min',
            originSummary: ['FoodDiscovery'],
          },
          reason: `A top-rated choice, freshly made and ready for you!`,
        };

        const recommendationPayload = {
          type: 'recommendations',
          messageId: assistantMessageId,
          data: [recommendationCard],
        };

        // Stream the JSON payload
        res.write(JSON.stringify(recommendationPayload) + '\n');
      }

      res.end(); // End the response after sending data

      // Save conversation to DB in the background
      saveConversation(threadId, userId, isNewThread, userMessageText, conversationalText);

    } else {
      // --- Handle General Conversation Flow ---
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const chat = model.startChat({
        history: (chatHistory || [])
          .filter(msg => msg.role === 'user' || msg.role === 'assistant')
          .map(msg => ({ role: msg.role === 'user' ? 'user' : 'model', parts: [{ text: msg.text }] })),
      });
      const result = await chat.sendMessageStream(userMessageText);

      let fullResponseText = '';
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullResponseText += chunkText;
        res.write(chunkText);
      }

      res.end();

      // Save conversation to DB in the background
      saveConversation(threadId, userId, isNewThread, userMessageText, fullResponseText);
    }
  } catch (error) {
    console.error('Error in chat message handler:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to process chat message.' });
    }
  }
}

// --- Helper function for DB Operations ---
async function saveConversation(threadId, userId, isNewThread, userMessageText, assistantResponseText) {
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

    const userMessageDoc = {
      _id: new ObjectId(),
      role: 'user',
      text: userMessageText,
      userId,
      threadId: new ObjectId(threadId),
      createdAt: new Date(),
    };

    const assistantMessageDoc = {
      _id: new ObjectId(),
      role: 'assistant',
      text: assistantResponseText,
      userId,
      threadId: new ObjectId(threadId),
      createdAt: new Date(),
    };

    await messagesCollection.insertMany([userMessageDoc, assistantMessageDoc]);
  } catch (dbError) {
    console.error("Error saving chat conversation to DB:", dbError);
  }
}

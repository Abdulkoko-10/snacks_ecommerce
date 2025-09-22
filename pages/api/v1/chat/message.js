import { getAuth } from '@clerk/nextjs/server';
import { ObjectId } from 'mongodb';
import clientPromise from '../../../../lib/mongodb';
import { previewClient, urlFor } from '../../../../lib/client'; // Import Sanity client
const { GoogleGenerativeAI } = require('@google/generative-ai');

// eslint-disable-next-line no-unused-vars
const { ChatMessage, ChatRecommendationPayload } = require('../../../../schemas/chat');

const dbName = process.env.MONGODB_DB_NAME || 'food-discovery';

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
      return res.status(400).json({ error: 'Bad Request: "text" is required in the request body.' });
    }

    let threadId = currentThreadId;
    let isNewThread = !threadId;
    if (isNewThread) {
      threadId = new ObjectId().toString();
    }

    res.setHeader('X-Thread-Id', threadId); // Send threadId back as a header

    // --- Generate AI Response ---
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const instruction = { role: "system", content: "You are a helpful and friendly food discovery assistant. Please respond to the user in a conversational way." };
    const history = (chatHistory || [])
      .filter(msg => msg.role === 'user' || msg.role === 'assistant')
      .map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

    const contents = [...history, { role: 'user', parts: [{ text: userMessageText }] }];

    const result = await model.generateContent({ contents: [instruction, ...contents] });
    const response = result.response;
    const fullResponseText = response.text();

    // --- Fetch Product Recommendations from Sanity ---
    const productsQuery = `*[_type == "product"] | order(_createdAt desc) [0...3]`;
    const sanityProducts = await previewClient.fetch(productsQuery);

    const recommendations = sanityProducts.map(p => ({
      canonicalProductId: p._id,
      preview: {
        title: p.name,
        image: p.image ? urlFor(p.image[0]).width(400).url() : '/default-product-image.png',
        rating: 4.5, // Mock rating as it's not in the product schema
        minPrice: p.price,
        bestProvider: "SnacksCo", // Mock provider
        eta: "15-25 min", // Mock ETA
        originSummary: ["SnacksCo"], // Mock origin
      },
      reason: "Based on our conversation, you might like this!", // Generic reason
      meta: {
        generatedBy: "system-rule",
        confidence: 0.9,
      }
    }));

    // --- Response payload ---
    const payload = {
      fullText: fullResponseText,
      recommendations: recommendations,
    };

    res.status(200).json(payload);

    // --- Perform Database Writes After Streaming ---
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

        const userMessage = {
          id: `user_msg_${Date.now()}`,
          role: 'user',
          text: userMessageText,
          userId,
          threadId,
          createdAt: new Date(),
        };

        const assistantMessage = {
          id: `asst_msg_${Date.now()}`,
          role: 'assistant',
          text: fullResponseText, // Save the complete response
          userId,
          threadId,
          createdAt: new Date(),
        };

        await messagesCollection.insertOne(userMessage);
        await messagesCollection.insertOne(assistantMessage);
      } catch (dbError) {
        console.error("Error saving chat conversation to DB:", dbError);
      }
    };

    saveToDb();

  } catch (error) {
    console.error('Error in chat message handler:', error);
    // If headers are not sent, we can send an error response.
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to process chat message.' });
    }
  }
}

import { getAuth } from '@clerk/nextjs/server';
import { ObjectId } from 'mongodb';
import clientPromise from '../../../../lib/mongodb';
import { getAiRecommendations } from '../../../../lib/ai/recommendations';
const { GoogleGenerativeAI } = require('@google/generative-ai');

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

    res.setHeader('X-Thread-Id', threadId);

    // --- Generate AI-powered recommendations and conversational response ---
    const [recommendations, conversationalResponse] = await Promise.all([
      getAiRecommendations(userMessageText),
      generateConversationalResponse(apiKey, chatHistory, userMessageText),
    ]);

    // --- Response payload ---
    const payload = {
      fullText: conversationalResponse,
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
          text: conversationalResponse,
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
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to process chat message.' });
    }
  }
}

/**
 * Generates a conversational response from the AI.
 * @param {string} apiKey The Gemini API key.
 * @param {Array} chatHistory The history of the conversation.
 * @param {string} userMessageText The latest message from the user.
 * @returns {Promise<string>} The AI's text response.
 */
async function generateConversationalResponse(apiKey, chatHistory, userMessageText) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: "You are a helpful and friendly food discovery assistant. Please respond to the user in a conversational way. Keep your responses concise and focused on the food recommendations being provided.",
  });

  const history = (chatHistory || [])
    .filter(msg => msg.role === 'user' || msg.role === 'assistant')
    .map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

  const chat = model.startChat({
    history: history,
    generationConfig: {
      maxOutputTokens: 150,
    },
  });

  const result = await chat.sendMessage(userMessageText);
  return result.response.text();
}
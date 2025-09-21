import { getAuth } from '@clerk/nextjs/server';
import { ObjectId } from 'mongodb';
import clientPromise from '../../../../lib/mongodb';
const { GoogleGenAI } = require('@google/genai');

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

    // --- Get AI Response First ---
    const genAI = new GoogleGenAI(apiKey);
    const instruction = { role: "user", parts: [{ text: "You are a helpful and friendly food discovery assistant. Please respond to the user in a conversational way." }] };
    const history = (chatHistory || [])
      .filter(msg => msg.role === 'user' || msg.role === 'assistant')
      .map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      }));
    history.push({ role: 'user', parts: [{ text: userMessageText }] });
    const contents = [instruction, ...history];

    const result = await genAI.models.generateContent({ model: "gemini-2.5-pro", contents });
    const geminiText = result.text;
    const recommendationPayload = null; // Placeholder

    // --- Respond to User Immediately ---
    let threadId = currentThreadId;
    let isNewThread = !threadId;

    // If it's a new thread, we'll need to generate an ID for the response,
    // which will be confirmed by the database write later.
    if (isNewThread) {
        threadId = new ObjectId().toString();
    }

    const assistantMessage = {
      id: `asst_msg_${Date.now()}`,
      role: 'assistant',
      text: geminiText,
      userId,
      threadId,
      createdAt: new Date(),
      ...(recommendationPayload && { recommendationPayload }),
    };

    res.status(200).json({ message: assistantMessage, recommendationPayload, threadId });

    // --- Perform Database Writes in the Background ---
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
          id: `user_msg_${Date.now()}`, // Note: this ID is different from the one in frontend state
          role: 'user',
          text: userMessageText,
          userId,
          threadId,
          createdAt: new Date(),
        };

        await messagesCollection.insertOne(userMessage);
        await messagesCollection.insertOne(assistantMessage); // Save the same assistant message we sent
      } catch (dbError) {
        console.error("Error saving chat conversation to DB:", dbError);
      }
    };

    saveToDb(); // Fire and forget

  } catch (error) {
    console.error('Error in chat message handler:', error);
    res.status(500).json({ error: 'Failed to process chat message.' });
  }
}

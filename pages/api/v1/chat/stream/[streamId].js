import { getAuth } from '@clerk/nextjs/server';
import { ObjectId } from 'mongodb';
import clientPromise from '../../../../../lib/mongodb';
const { GoogleGenAI } = require('@google/genai');

const dbName = process.env.MONGODB_DB_NAME || 'food-discovery';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { streamId } = req.query;
  if (!streamId) {
    return res.status(400).json({ error: 'Bad Request: "streamId" is required.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Server configuration error: Missing API key.');
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  const client = await clientPromise;
  const db = client.db(dbName);
  const sessionsCollection = db.collection('chat_sessions');
  const session = await sessionsCollection.findOne({ _id: new ObjectId(streamId), userId });

  if (!session) {
    return res.status(404).json({ error: 'Chat session not found or expired.' });
  }

  try {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    const { chatHistory, userMessageText } = session;

    const genAI = new GoogleGenAI(apiKey);
    const model = "gemini-2.0-flash";
    const instruction = { role: "user", parts: [{ text: "You are a helpful and friendly food discovery assistant. Please respond to the user in a conversational way." }] };
    const history = (chatHistory || [])
      .filter(msg => msg.role === 'user' || msg.role === 'assistant')
      .map(msg => ({ role: msg.role === 'user' ? 'user' : 'model', parts: [{ text: msg.text }] }));
    history.push({ role: 'user', parts: [{ text: userMessageText }] });
    const contents = [instruction, ...history];

    const result = await genAI.models.generateContentStream({ model, contents });

    let fullResponseText = '';
    for await (const chunk of result) {
      // Using optional chaining for safety, in case the structure is unexpected.
      const chunkText = chunk?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (chunkText) {
        fullResponseText += chunkText;
        res.write(`event: text-chunk\ndata: ${JSON.stringify({ text: chunkText })}\n\n`);
      }
    }

    res.write('event: end\ndata: {}\n\n');
    res.end();

    // --- Perform Database Writes After Streaming ---
    const saveToDb = async () => {
      try {
        const messagesCollection = db.collection('chat_messages');
        const threadsCollection = db.collection('threads');
        const { threadId, userMessageText } = session;

        // Check if it's a new thread by seeing if it exists in the threads collection
        const existingThread = await threadsCollection.findOne({ _id: threadId });
        if (!existingThread) {
          await threadsCollection.insertOne({
            _id: threadId,
            userId,
            title: userMessageText.substring(0, 50),
            createdAt: new Date(),
            lastUpdated: new Date(),
          });
        } else {
          await threadsCollection.updateOne({ _id: threadId, userId }, { $set: { lastUpdated: new Date() } });
        }

        const userMessage = {
          role: 'user',
          text: userMessageText,
          userId,
          threadId,
          createdAt: new Date(),
        };

        const assistantMessage = {
          role: 'assistant',
          text: fullResponseText,
          userId,
          threadId,
          createdAt: new Date(),
        };

        await messagesCollection.insertMany([userMessage, assistantMessage]);
      } catch (dbError) {
        console.error("Error saving chat conversation to DB:", dbError);
      }
    };

    saveToDb();

  } catch (error) {
    console.error('Error in chat stream handler:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to process chat stream.' });
    }
  } finally {
    // Clean up the session document after the stream is finished
    await sessionsCollection.deleteOne({ _id: new ObjectId(streamId) });
  }
}

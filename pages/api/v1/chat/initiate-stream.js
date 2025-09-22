import { getAuth } from '@clerk/nextjs/server';
import { ObjectId } from 'mongodb';
import clientPromise from '../../../../lib/mongodb';

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

  try {
    const { text, chatHistory, threadId: currentThreadId } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Bad Request: "text" is required.' });
    }

    const client = await clientPromise;
    const db = client.db(dbName);
    const sessionsCollection = db.collection('chat_sessions');

    // IMPORTANT: A TTL index should be created on the `createdAt` field in MongoDB
    // for the `chat_sessions` collection to automatically clean up old sessions.
    // Example mongo shell command:
    // db.chat_sessions.createIndex({ "createdAt": 1 }, { expireAfterSeconds: 300 })
    const streamId = new ObjectId().toString();
    const threadId = currentThreadId || new ObjectId().toString();

    await sessionsCollection.insertOne({
      _id: new ObjectId(streamId),
      threadId: new ObjectId(threadId),
      userId,
      chatHistory,
      userMessageText: text,
      createdAt: new Date(),
    });

    res.status(200).json({ streamId, threadId });

  } catch (error) {
    console.error('Error initiating chat stream:', error);
    res.status(500).json({ error: 'Failed to initiate chat stream.' });
  }
}

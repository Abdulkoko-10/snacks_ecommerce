import { getAuth } from '@clerk/nextjs/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
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

  if (!uri) {
    return res.status(500).json({ error: 'Server configuration error: Missing MONGODB_URI' });
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('chat_messages');

    // Find all messages for the user, sort by creation date
    const messages = await collection.find({ userId }).sort({ createdAt: 1 }).toArray();

    // We also need to fetch the recommendations associated with each message.
    // For simplicity, we'll assume recommendations are stored with the assistant's message.
    // The frontend expects a `messages` array and a `recommendationsByMessageId` map.

    const recommendationsByMessageId = {};
    messages.forEach(message => {
      if (message.role === 'assistant' && message.recommendationPayload) {
        recommendationsByMessageId[message.id] = message.recommendationPayload.recommendations;
        // We can remove the payload from the message itself to keep the response clean,
        // as the frontend doesn't expect it there.
        delete message.recommendationPayload;
      }
    });

    res.status(200).json({ messages, recommendationsByMessageId });
  } catch (error) {
    console.error('Failed to fetch chat history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history.' });
  } finally {
    await client.close();
  }
}

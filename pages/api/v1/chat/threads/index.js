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

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('chat_messages');

    // This aggregation pipeline groups messages by threadId, finds the first message
    // to use as a title, and gets the last updated time for sorting.
    const threads = await collection.aggregate([
      { $match: { userId } },
      { $sort: { createdAt: 1 } },
      {
        $group: {
          _id: "$threadId",
          title: { $first: "$text" },
          lastUpdated: { $last: "$createdAt" },
        }
      },
      { $sort: { lastUpdated: -1 } },
      {
        $project: {
          threadId: "$_id",
          title: 1,
          lastUpdated: 1,
          _id: 0
        }
      }
    ]).toArray();

    res.status(200).json(threads);

  } catch (error) {
    console.error('Failed to fetch chat threads:', error);
    res.status(500).json({ error: 'Failed to fetch chat threads.' });
  } finally {
    await client.close();
  }
}

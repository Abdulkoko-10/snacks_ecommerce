import { getAuth } from '@clerk/nextjs/server';
import clientPromise from '../../../../lib/mongodb';

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

  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    const collection = db.collection('threads');

    // Find all threads for the user, sort by last updated
    const threads = await collection.find({ userId }).sort({ lastUpdated: -1 }).toArray();

    res.status(200).json(threads);

  } catch (error) {
    console.error('Failed to fetch chat threads:', error);
    res.status(500).json({ error: 'Failed to fetch chat threads.' });
  }
}

import { getAuth } from '@clerk/nextjs/server';
import { ObjectId } from 'mongodb';
import clientPromise from '../../../../../lib/mongodb';

const dbName = process.env.MONGODB_DB_NAME || 'food-discovery';

export default async function handler(req, res) {
  const { threadId } = req.query;

  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    const threadsCollection = db.collection('threads');
    const messagesCollection = db.collection('chat_messages');

    if (req.method === 'PUT') {
      const { title } = req.body;
      if (!title) {
        return res.status(400).json({ error: 'Title is required' });
      }

      const result = await threadsCollection.updateOne(
        { _id: new ObjectId(threadId), userId },
        { $set: { title } }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Thread not found or you do not have permission to rename it.' });
      }

      return res.status(200).json({ message: 'Thread renamed successfully' });

    } else if (req.method === 'DELETE') {
      // Ensure the user owns the thread before deleting
      const thread = await threadsCollection.findOne({ _id: new ObjectId(threadId), userId });
      if (!thread) {
        return res.status(404).json({ error: 'Thread not found or you do not have permission to delete it.' });
      }

      // Perform deletions
      await messagesCollection.deleteMany({ userId, threadId });
      await threadsCollection.deleteOne({ _id: new ObjectId(threadId), userId });

      return res.status(200).json({ message: 'Thread and all its messages deleted successfully' });

    } else {
      res.setHeader('Allow', ['PUT', 'DELETE']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

  } catch (error) {
    console.error(`Failed to handle thread request for threadId ${threadId}:`, error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
}

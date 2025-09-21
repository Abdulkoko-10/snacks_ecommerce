import { getAuth } from '@clerk/nextjs/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'food-discovery';

export default async function handler(req, res) {
  const { threadId } = req.query;

  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('chat_messages');

    if (req.method === 'PUT') {
      // Renaming a thread is complex with the current schema, as the title is
      // derived from the first message. A proper implementation would likely
      // involve a separate `threads` collection with a dedicated title field.
      // For now, we'll return a "Not Implemented" status.
      const { title } = req.body;
      if (!title) {
        return res.status(400).json({ error: 'Title is required' });
      }
      // TODO: Implement renaming logic, possibly by adding a `title` field
      // to a new `threads` collection or updating the first message.
      return res.status(501).json({ error: 'Renaming not implemented' });

    } else if (req.method === 'DELETE') {
      const result = await collection.deleteMany({ userId, threadId });

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Thread not found or you do not have permission to delete it.' });
      }

      return res.status(200).json({ message: 'Thread deleted successfully' });

    } else {
      res.setHeader('Allow', ['PUT', 'DELETE']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

  } catch (error) {
    console.error(`Failed to handle thread request for threadId ${threadId}:`, error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  } finally {
    await client.close();
  }
}

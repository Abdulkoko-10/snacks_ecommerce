import { writeClient } from '../../lib/client';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { reviewId, user, comment } = req.body;

    if (!reviewId || !user || !comment) {
      return res.status(400).json({ message: 'Missing required fields (reviewId, user, comment)' });
    }

    try {
      const reply = {
        _key: uuidv4(), // Generate a unique key for the array item
        user,
        comment,
        createdAt: new Date().toISOString(),
      };

      await writeClient
        .patch(reviewId)
        .setIfMissing({ replies: [] })
        .append('replies', [reply])
        .commit();

      res.status(200).json({ message: 'Reply submitted successfully' });
    } catch (error) {
      console.error('Error creating reply:', error);
      res.status(500).json({ message: 'Error submitting reply', error: error.message });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}

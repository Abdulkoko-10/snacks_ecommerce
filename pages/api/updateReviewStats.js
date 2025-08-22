import { writeClient } from '../../lib/client';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { reviewId, action } = req.body;

    if (!reviewId || !action || !['like', 'dislike'].includes(action)) {
      return res.status(400).json({ message: 'Missing or invalid required fields (reviewId, action)' });
    }

    try {
      const patch = writeClient.patch(reviewId);

      if (action === 'like') {
        patch.inc({ likes: 1 });
      } else if (action === 'dislike') {
        patch.inc({ dislikes: 1 });
      }

      await patch.commit();

      res.status(200).json({ message: 'Review stats updated successfully' });
    } catch (error) {
      console.error('Error updating review stats:', error);
      res.status(500).json({ message: 'Error updating review stats', error: error.message });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}

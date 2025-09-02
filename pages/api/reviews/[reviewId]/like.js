import { writeClient } from '../../../../lib/client';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { reviewId } = req.query;
  const { like } = req.body; // like is a boolean: true for like, false for dislike

  if (typeof like !== 'boolean') {
    return res.status(400).json({ message: 'Missing or invalid `like` field in request body' });
  }

  if (!reviewId) {
    return res.status(400).json({ message: 'Missing reviewId' });
  }

  try {
    const patch = writeClient.patch(reviewId);

    if (like) {
      patch.inc({ likes: 1 });
    } else {
      patch.inc({ dislikes: 1 });
    }

    await patch.commit();

    res.status(200).json({ message: 'Review updated successfully' });
  } catch (error) {
    console.error('Error updating review likes:', error);
    res.status(500).json({ message: 'Error updating review', error: error.message });
  }
}

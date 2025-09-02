import { writeClient } from '../../../../lib/client';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { reviewId } = req.query;
  const { user, comment } = req.body;

  if (!user || !comment) {
    return res.status(400).json({ message: 'Missing required fields: user, comment' });
  }

  if (!reviewId) {
    return res.status(400).json({ message: 'Missing reviewId' });
  }

  try {
    const reply = {
      _key: `${Date.now()}-${user.replace(/\s+/g, '-')}`, // Unique key for the reply
      _type: 'reply',
      user,
      comment,
      createdAt: new Date().toISOString(),
    };

    await writeClient
      .patch(reviewId)
      .setIfMissing({ replies: [] })
      .append('replies', [reply])
      .commit({ autoGenerateArrayKeys: true });

    res.status(200).json({ message: 'Reply added successfully' });
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({ message: 'Error adding reply', error: error.message });
  }
}

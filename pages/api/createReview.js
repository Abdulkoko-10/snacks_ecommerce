import { client as baseClient } from '../../lib/client'; // Import as baseClient

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { user, rating, reviewTitle, comment, productId } = req.body;

    // Basic validation
    if (!user || !rating || !comment || !productId) {
      return res.status(400).json({ message: 'Missing required fields (user, rating, comment, productId)' });
    }

    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be a number between 1 and 5.' });
    }

    // Check for the Sanity write token
    if (!process.env.SANITY_API_WRITE_TOKEN) {
      console.error('CRITICAL: SANITY_API_WRITE_TOKEN is not set in the environment. Review submission will fail.');
      // It's important not to reveal to the client that the token is missing.
      // A generic server error is more appropriate for the client response.
      return res.status(500).json({ message: 'Error submitting review due to server configuration issue.' });
    }

    try {
      const doc = {
        _type: 'review',
        user,
        rating: Number(rating), // Ensure rating is a number
        reviewTitle: reviewTitle || '', // Default to empty string if not provided
        comment,
        product: {
          _type: 'reference',
          _ref: productId,
        },
        createdAt: new Date().toISOString(),
        approved: false, // Reviews default to not approved
      };

      // Create a new client instance configured for writes
      const writeClient = baseClient.withConfig({
        token: process.env.SANITY_API_WRITE_TOKEN, // Use server-side token for writes
        useCdn: false, // Ensure CDN is false for writes
        // projectId and dataset are inherited from baseClient
      });

      await writeClient.create(doc);
      res.status(200).json({ message: 'Review submitted successfully and is awaiting approval!' });
    } catch (error) {
      console.error('Error creating review:', error);
      // It's good practice to not expose detailed Sanity client errors to the user
      // but log them server-side for debugging.
      // Also, ensure the token has write access to the dataset in Sanity manage.
      res.status(500).json({ message: 'Error submitting review' });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}

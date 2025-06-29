import { writeClient as configuredWriteClient } from '../../lib/client'; // Import the pre-configured writeClient

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

    // Check if the configuredWriteClient is available (it might be null if SANITY_API_WRITE_TOKEN is missing)
    if (!configuredWriteClient) {
      console.error('CRITICAL: Sanity write client (configuredWriteClient) is not initialized in createReview. SANITY_API_WRITE_TOKEN might be missing or invalid.');
      return res.status(500).json({ message: 'Error submitting review due to server configuration issue. Please check SANITY_API_WRITE_TOKEN.' });
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

      // Use the imported and pre-configured writeClient directly
      await configuredWriteClient.create(doc);
      res.status(200).json({ message: 'Review submitted successfully and is awaiting approval!' });
    } catch (error) {
      console.error('Error creating review:', error);
      // Log more details from the error, similar to createPreOrder
      let errorMessage = 'Error submitting review';
      let errorDetails = error.message;
      let statusCode = 500;

      if (error.response && error.response.body && error.response.body.error) {
        console.error('Sanity error details from response body (createReview):', JSON.stringify(error.response.body.error, null, 2));
        const sanityError = error.response.body.error;
        errorMessage = sanityError.description || sanityError.message || 'Error processing review with database.';
        errorDetails = sanityError;
        statusCode = error.response.statusCode || statusCode;
      } else if (error.response && typeof error.response.body === 'string') {
        console.error('Sanity string error response body (createReview):', error.response.body);
        errorMessage = 'Error from database provider (review).';
        errorDetails = error.response.body;
        statusCode = error.response.statusCode || statusCode;
      } else {
        console.error('Full error object (createReview):', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      }

      res.status(statusCode).json({ message: errorMessage, details: errorDetails });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}

import type { NextApiRequest, NextApiResponse } from 'next';
import { getAiRecommendations } from '../../../lib/ai/recommendations';
import { CanonicalRestaurant } from '@fd/schemas';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CanonicalRestaurant[] | { error: string }>
) {
  const query = req.query.q as string;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter "q" is required.' });
  }

  try {
    // Call the new AI-powered recommendation service
    const results = await getAiRecommendations(query);

    // The AI service now returns data in the desired format,
    // but we need to ensure it matches the CanonicalRestaurant schema for the frontend.
    // The `getAiRecommendations` function is already designed to return a compatible structure.
    // We will cast the result to the expected type for the response.
    const typedResults: CanonicalRestaurant[] = results.map((rec: any) => ({
      placeId: rec.canonicalProductId,
      name: rec.preview.title,
      address: rec.preview.details, // Using details as a substitute for address
      rating: rec.preview.rating,
      website: rec.preview.slug ? `/product/${rec.preview.slug}` : undefined,
      phone_number: undefined, // Not available from our product schema
    }));

    res.status(200).json(typedResults);
  } catch (error) {
    console.error("Error in /api/v1/search handler:", error);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
}
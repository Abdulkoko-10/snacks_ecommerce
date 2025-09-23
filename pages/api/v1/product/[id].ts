import { getJson } from "serpapi";
import dotenv from "dotenv";
import type { NextApiRequest, NextApiResponse } from 'next';

dotenv.config({ path: '.env.local' });

const SERPAPI_API_KEY = process.env.SERPAPI_API_KEY;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse // Using `any` for now as the schema is not defined yet
) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Product ID must be a string.' });
  }

  if (!SERPAPI_API_KEY) {
    console.warn("SERPAPI_API_KEY is not defined. Returning mock data for product details.");
    // Return mock data that matches the expected detailed structure
    return res.status(200).json({
      placeId: id,
      name: "The Mock Pizzeria (Detailed)",
      address: "123 Fake St, Nextville",
      rating: 4.8,
      reviews: 123,
      photos: ["/FoodDiscovery.jpg", "/FoodDiscovery.jpg"], // Placeholder images
      user_reviews: [
        { user: { name: "John Doe" }, rating: 5, text: "Amazing pizza, will come again!" },
        { user: { name: "Jane Smith" }, rating: 4, text: "Good food, but a bit pricey." }
      ]
    });
  }

  try {
    const response = await getJson({
      engine: "google_place_details",
      place_id: id,
      api_key: SERPAPI_API_KEY,
    });

    // TODO: Add a Zod schema for CanonicalProduct and parse the response
    // For now, we return the raw response details
    res.status(200).json(response.place_details);

  } catch (error) {
    console.error(`Error fetching product details for placeId ${id}:`, error);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
}

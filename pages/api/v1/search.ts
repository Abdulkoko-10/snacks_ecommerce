import { getJson } from "serpapi";
import dotenv from "dotenv";
import { CanonicalRestaurant, CanonicalRestaurantSchema } from "@fd/schemas";
import type { NextApiRequest, NextApiResponse } from 'next';

dotenv.config();

const SERPAPI_API_KEY = process.env.SERPAPI_API_KEY;

// The searchRestaurants function is copied from the original connector,
// with minor adjustments for logging in a serverless environment.
async function searchRestaurants(query: string): Promise<CanonicalRestaurant[]> {
  if (!SERPAPI_API_KEY) {
    console.warn("SERPAPI_API_KEY is not defined. Returning mock data.");
    return [
      {
        placeId: "mock-place-id-from-next-api",
        name: "The Mock Pizzeria (Next.js API)",
        address: "123 Fake St, Nextville",
        rating: 4.8,
      }
    ];
  }

  try {
    const response = await getJson({
      engine: "google_maps",
      q: query,
      api_key: SERPAPI_API_KEY,
    });

    const localResults = response.local_results || [];

    // Using .flatMap to handle potential parsing errors gracefully
    const transformedResults: CanonicalRestaurant[] = localResults.flatMap((result: any) => {
      try {
        const restaurant: Partial<CanonicalRestaurant> = {
          placeId: result.place_id,
          name: result.title,
          address: result.address,
          rating: result.rating,
          website: result.website,
          phone_number: result.phone,
        };
        // Return an array with the parsed result
        return [CanonicalRestaurantSchema.parse(restaurant)];
      } catch (error) {
        console.warn(`Skipping a result due to validation error:`, error);
        // Return an empty array for this item if parsing fails
        return [];
      }
    });

    return transformedResults;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching data from SerpApi:", error.message);
    } else {
      console.error("An unknown error occurred while fetching from SerpApi.");
    }
    // In case of a major error with the API call itself, return an empty array
    return [];
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CanonicalRestaurant[] | { error: string }>
) {
  const query = req.query.q as string;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter "q" is required.' });
  }

  try {
    const results = await searchRestaurants(query);
    res.status(200).json(results);
  } catch (error) {
    console.error("Error in /api/v1/search handler:", error);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
}

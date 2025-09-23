import express, { Request, Response } from "express";
import { getJson } from "serpapi";
import dotenv from "dotenv";
import { CanonicalRestaurant, CanonicalRestaurantSchema } from "@fd/schemas";

dotenv.config();

const app = express();
const port = process.env.CONNECTOR_PORT || 3002;

app.use(express.json());

const SERPAPI_API_KEY = process.env.SERPAPI_API_KEY;

async function searchRestaurants(query: string): Promise<CanonicalRestaurant[]> {
  if (!SERPAPI_API_KEY) {
    console.warn("SERPAPI_API_KEY is not defined. Returning mock data.");
    return [
      {
        placeId: "mock-place-id-from-connector",
        name: "The Mock Pizzeria (Connector)",
        address: "123 Fake St, Mockville",
        rating: 4.5,
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
    const transformedResults: CanonicalRestaurant[] = localResults.map((result: any) => {
      const restaurant: Partial<CanonicalRestaurant> = {
        placeId: result.place_id,
        name: result.title,
        address: result.address,
        rating: result.rating,
        website: result.website,
        phone_number: result.phone,
      };
      return CanonicalRestaurantSchema.parse(restaurant);
    }).filter((r: CanonicalRestaurant | null): r is CanonicalRestaurant => r !== null);

    return transformedResults;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching data from SerpApi:", error.message);
    } else {
      console.error("An unknown error occurred while fetching from SerpApi.");
    }
    return [];
  }
}

app.get('/search', async (req: Request, res: Response) => {
  const query = req.query.q as string;
  if (!query) {
    return res.status(400).json({ error: 'Query parameter "q" is required.' });
  }
  try {
    const results = await searchRestaurants(query);
    res.json(results);
  } catch (error) {
    console.error("Error in connector search endpoint:", error);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
});

app.listen(port, () => {
  console.log(`SerpApi connector listening on port ${port}`);
});

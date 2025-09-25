import { getJson } from "serpapi";
import dotenv from "dotenv";
// Import the new schema and type
import { CanonicalProduct, CanonicalProductSchema } from "@fd/schemas";
import type { NextApiRequest, NextApiResponse } from 'next';

dotenv.config({ path: '.env.local' });

const SERPAPI_API_KEY = process.env.SERPAPI_API_KEY;

// The function will now search for products and return CanonicalProduct array
async function searchProducts(query: string): Promise<CanonicalProduct[]> {
  if (!SERPAPI_API_KEY) {
    console.warn("SERPAPI_API_KEY is not defined. Returning mock data.");
    // Return mock data that conforms to CanonicalProductSchema
    return [
      {
        canonicalProductId: "mock-product-id-1",
        title: "Mock Pizza",
        images: ["https://via.placeholder.com/150"],
        description: "A delicious mock pizza from a mock restaurant.",
        price: { amount: 12.99, currency: "USD" },
        rating: 4.5,
        numRatings: 100,
        tags: ["pizza", "mock"],
        sources: [{
          provider: "MockProvider",
          providerProductId: "mock-provider-id-1",
          price: 12.99,
          lastFetchedAt: new Date().toISOString(),
        }],
        comments: [],
        popularityScore: 0.8,
        lastFetchedAt: new Date().toISOString(),
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

    // Transform the results into CanonicalProduct
    const transformedResults: CanonicalProduct[] = localResults.flatMap((result: any) => {
      try {
        // Create a product object with mock data for missing fields
        // Note: this is a temporary adaptation. The real orchestrator will handle this.
        const product: CanonicalProduct = {
          canonicalProductId: `serpapi::${result.place_id}`,
          title: result.title,
          images: result.thumbnail ? [result.thumbnail] : [],
          description: result.address || "No description available.",
          price: {
            amount: result.price ? parseFloat(result.price.replace(/[^0-9.-]+/g,"")) : 0,
            currency: "USD" // Assuming USD, as it's often not provided
          },
          rating: result.rating,
          numRatings: result.reviews,
          tags: result.type ? [result.type] : [],
          sources: [{
            provider: "serpapi_google_maps",
            providerProductId: result.place_id,
            price: result.price ? parseFloat(result.price.replace(/[^0-9.-]+/g,"")) : 0,
            deliveryEtaMin: undefined, // Not available in this API
            lastFetchedAt: new Date().toISOString(),
          }],
          comments: [],
          popularityScore: result.rating ? result.rating / 5 : 0,
          lastFetchedAt: new Date().toISOString(),
        };

        // Validate the created product object
        return [CanonicalProductSchema.parse(product)];
      } catch (error) {
        console.warn(`Skipping a result due to validation error:`, error);
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
    return [];
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CanonicalProduct[] | { error: string }>
) {
  const query = req.query.q as string;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter "q" is required.' });
  }

  try {
    // Call the updated function
    const results = await searchProducts(query);
    res.status(200).json(results);
  } catch (error) {
    console.error("Error in /api/v1/search handler:", error);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
}
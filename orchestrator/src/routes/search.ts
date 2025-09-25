import { Router } from 'express';
import { getJson } from "serpapi";
import { CanonicalProduct, CanonicalProductSchema } from "@fd/schemas";

const router = Router();
const SERPAPI_API_KEY = process.env.SERPAPI_API_KEY;

async function searchProducts(query: string): Promise<CanonicalProduct[]> {
  if (!SERPAPI_API_KEY) {
    console.warn("SERPAPI_API_KEY is not defined. Returning mock data from orchestrator.");
    return [
      {
        canonicalProductId: "mock-product-id-1",
        title: "Mock Pizza from Orchestrator",
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

    const transformedResults: CanonicalProduct[] = localResults.flatMap((result: any) => {
      try {
        const product: CanonicalProduct = {
          canonicalProductId: `serpapi::${result.place_id}`,
          title: result.title,
          images: result.thumbnail ? [result.thumbnail] : [],
          description: result.address || "No description available.",
          price: {
            amount: result.price ? parseFloat(result.price.replace(/[^0-9.-]+/g,"")) : 0,
            currency: "USD"
          },
          rating: result.rating,
          numRatings: result.reviews,
          tags: result.type ? [result.type] : [],
          sources: [{
            provider: "serpapi_google_maps",
            providerProductId: result.place_id,
            price: result.price ? parseFloat(result.price.replace(/[^0-9.-]+/g,"")) : 0,
            deliveryEtaMin: undefined,
            lastFetchedAt: new Date().toISOString(),
          }],
          comments: [],
          popularityScore: result.rating ? result.rating / 5 : 0,
          lastFetchedAt: new Date().toISOString(),
        };

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

router.get('/', async (req, res) => {
  const query = req.query.q as string;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter "q" is required.' });
  }

  try {
    const results = await searchProducts(query);
    res.status(200).json(results);
  } catch (error) {
    console.error("Error in /api/v1/search handler:", error);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
});

export default router;
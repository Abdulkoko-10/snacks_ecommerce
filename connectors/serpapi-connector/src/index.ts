const { getJson } = require("serpapi");
const { CanonicalProductSchema } = require("@fd/schemas");
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');

// Load environment variables from .env file
dotenv.config();

const SERPAPI_API_KEY = process.env.SERPAPI_API_KEY;

if (!SERPAPI_API_KEY) {
  console.error("SERPAPI_API_KEY is not defined in the environment variables.");
  process.exit(1);
}

/**
 * Transforms a raw result from the SerpApi Google Local Services endpoint
 * into the CanonicalProduct schema.
 *
 * @param rawResult - The raw data object from the SerpApi response.
 * @returns A partial CanonicalProduct object.
 */
function transformToCanonicalProduct(rawResult: any) {
    const now = new Date().toISOString();

    return {
        canonicalProductId: `serpapi::${rawResult.place_id || uuidv4()}`,
        title: rawResult.title,
        address: rawResult.address || 'Address not available',
        images: rawResult.images || [],
        description: rawResult.description || 'No description available.',
        price: {
            amount: parseFloat(rawResult.price?.replace('$', '')) || 0,
            currency: 'USD',
        },
        rating: rawResult.rating || 0,
        numRatings: rawResult.reviews || 0,
        tags: rawResult.extensions || [],
        sources: [{
            provider: 'SerpApi-GoogleLocalServices',
            providerProductId: rawResult.place_id,
            price: parseFloat(rawResult.price?.replace('$', '')) || 0,
            deliveryEtaMin: null,
            lastFetchedAt: now,
        }],
        comments: [],
        popularityScore: rawResult.rating * (rawResult.reviews || 1),
        lastFetchedAt: now,
    };
}


/**
 * Fetches local service data from SerpApi for a given query.
 * @param query - The search query (e.g., "pizza in new york").
 * @returns A promise that resolves to an array of CanonicalProduct objects.
 */
async function fetchAndTransform(query: string) {
  try {
    console.log(`Fetching data for query: "${query}"...`);
    const response = await getJson({
      engine: "google_local_services",
      q: query,
      api_key: SERPAPI_API_KEY,
    });

    const localServices = response.local_services || [];
    console.log(`Found ${localServices.length} results.`);

    const transformedProducts = localServices.map(transformToCanonicalProduct);

    const validatedProducts = transformedProducts.map((product: any) => {
        const validationResult = CanonicalProductSchema.safeParse(product);
        if (validationResult.success) {
            return validationResult.data;
        } else {
            console.error("Validation failed for product:", product);
            console.error("Validation errors:", validationResult.error.errors);
            return null;
        }
    }).filter((p: any) => p !== null);


    return validatedProducts;
  } catch (error) {
    console.error("An error occurred while fetching or transforming data:", error);
    return [];
  }
}

// Example usage:
(async () => {
    const products = await fetchAndTransform("plumbers in austin");
    console.log("Transformed and validated products:", JSON.stringify(products, null, 2));
})();
const { getJson } = require("serpapi");
const dotenv = require("dotenv");
// Use the new, correct schema for validation
const { CanonicalProductSchema } = require("@fd/schemas");

dotenv.config({ path: '.env.local' });

const SERPAPI_API_KEY = process.env.SERPAPI_API_KEY;

/**
 * The searchRestaurants function is the "connector" part of the orchestrator.
 * @param {object} intent - The search intent from Gemini.
 * @param {number} limit - The number of results to return.
 * @param {number} offset - The starting offset for pagination.
 * @param {{latitude: number, longitude: number}} geocode - The geocoded location.
 * @returns {Promise<Array<object>>} A list of canonical restaurant objects.
 */
async function searchRestaurants(intent, limit, offset, geocode) {
  if (!SERPAPI_API_KEY) {
    console.warn("SERPAPI_API_KEY is not defined. Returning mock data.");
    // Return mock data that conforms to the CanonicalProductSchema
    return [
      {
        canonicalProductId: 'serpapi::mock-place-id',
        title: 'The Mock Pizzeria (SerpApi Lib)',
        images: ['/FoodDiscovery.jpg'],
        description: 'A delicious mock pizza from a mock restaurant.',
        rating: 4.8,
        numRatings: 123,
        address: '123 Fake St, Nextville',
        placeId: 'mock-place-id-from-serpapi-lib',
        sources: [
          {
            provider: 'serpapi-google-maps',
            providerProductId: 'mock-place-id',
            lastFetchedAt: new Date().toISOString(),
          },
        ],
      },
    ];
  }

  try {
    const filterParts = Object.values(intent.filters);
    const detailedQuery = [intent.query, ...filterParts].join(' ');

    const params = {
      engine: "google_maps",
      q: detailedQuery,
      start: offset,
      num: limit,
      api_key: SERPAPI_API_KEY,
    };

    if (geocode) {
      params.ll = `@${geocode.latitude},${geocode.longitude},15z`;
    } else {
      params.location = intent.region;
    }

    const response = await getJson(params);

    const localResults = response.local_results || [];

    const transformedResults = localResults.flatMap((result) => {
      try {
        // Map the SerpApi result to the new CanonicalProductSchema
        const product = {
          canonicalProductId: `serpapi::${result.place_id}`,
          title: result.title,
          images: result.thumbnail ? [result.thumbnail] : ['/FoodDiscovery.jpg'], // Use thumbnail if available, else placeholder
          description: result.description,
          rating: result.rating,
          numRatings: result.reviews,
          address: result.address,
          placeId: result.place_id,
          sources: [
            {
              provider: 'serpapi-google-maps',
              providerProductId: result.place_id,
              lastFetchedAt: new Date().toISOString(),
            },
          ],
        };
        // Validate against the correct, updated schema
        return [CanonicalProductSchema.parse(product)];
      } catch (error) {
        console.warn(`Skipping a result due to validation error for placeId ${result.place_id}:`, error);
        return [];
      }
    });

    return transformedResults;
  } catch (error) {
    console.error("Full error object from SerpApi:", JSON.stringify(error, null, 2));
    if (error instanceof Error) {
      console.error("Error fetching data from SerpApi:", error.message);
    } else {
      console.error("An unknown error occurred while fetching from SerpApi.");
    }
    return [];
  }
}

module.exports = { searchRestaurants };

const { getJson } = require('serpapi');

// --- Data Transformation ---
const transformToCanonical = (item) => {
  const fetchedAt = new Date().toISOString();
  return {
    canonicalProductId: `serpapi::${item.place_id}`,
    title: item.title,
    images: item.thumbnail ? [item.thumbnail] : ['/default-product-image.png'],
    description: item.description || 'No description available.',
    price: {
      amount: 0, // SerpApi `price` field (e.g., "$$") is not a direct number.
      currency: 'USD',
    },
    rating: item.rating || 0,
    numRatings: item.reviews || 0,
    tags: item.type ? [item.type] : [],
    sources: [
      {
        provider: 'serpapi',
        providerProductId: item.place_id,
        price: null, // Not available as a number
        deliveryEtaMin: null, // Not available
        lastFetchedAt: fetchedAt,
      },
    ],
    comments: [],
    popularityScore: item.rating * (item.reviews || 1), // Simple popularity score
    lastFetchedAt: fetchedAt,
  };
};

// --- Serverless Function Handler ---
module.exports = async (req, res) => {
  // --- Pre-flight Checks ---
  const SERPAPI_API_KEY = process.env.SERPAPI_API_KEY;
  if (!SERPAPI_API_KEY) {
    console.error('CRITICAL ERROR: SERPAPI_API_KEY is not set.');
    return res.status(503).json({ error: 'Service Unavailable: SERPAPI_API_KEY not configured.' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { query, location } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Search query is required.' });
  }

  try {
    const params = {
      api_key: SERPAPI_API_KEY,
      engine: 'google_local',
      q: query,
      location: location || 'Austin, Texas, United States', // Default location
    };

    const json = await getJson(params);
    const results = json.local_results || [];
    const canonicalProducts = results.map(transformToCanonical);

    return res.status(200).json(canonicalProducts);
  } catch (error) {
    console.error('Error fetching data from SerpApi:', error.message);
    return res.status(500).json({ error: 'Failed to fetch data from SerpApi.' });
  }
};
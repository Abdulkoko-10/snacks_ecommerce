const express = require('express');
const { getJson } = require('serpapi');

const app = express();
app.use(express.json());

const PORT = process.env.SERPAPI_CONNECTOR_PORT || 3003;
const SERPAPI_API_KEY = process.env.SERPAPI_API_KEY;

// --- Pre-flight Checks ---
if (!SERPAPI_API_KEY) {
  console.error('CRITICAL ERROR: SERPAPI_API_KEY is not set.');
  console.error('The SerpApi connector cannot start without this variable.');
  process.exit(1); // Exit with a failure code
}
// --- End Pre-flight Checks ---

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

// Middleware to check for the API key
const checkApiKey = (req, res, next) => {
  if (!SERPAPI_API_KEY) {
    return res.status(503).json({ error: 'Service Unavailable: SERPAPI_API_KEY not configured.' });
  }
  next();
};

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.post('/search', checkApiKey, async (req, res) => {
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

    res.status(200).json(canonicalProducts);
  } catch (error) {
    console.error('Error fetching data from SerpApi:', error.message);
    res.status(500).json({ error: 'Failed to fetch data from SerpApi.' });
  }
});

app.listen(PORT, () => {
  console.log(`SerpApi Connector service listening on port ${PORT}`);
});

module.exports = app;
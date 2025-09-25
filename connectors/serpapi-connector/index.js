const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// A simple health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'serpapi-connector' });
});

const { getJson } = require("serpapi");
const { CanonicalProductSchema } = require('../../schemas/canonicalProduct');

// --- Main Search Endpoint ---
app.post('/search', async (req, res) => {
  const { query, location } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Missing "query" in request body.' });
  }

  try {
    const params = {
      engine: "google_local",
      q: query,
      location: location || "Austin, Texas, United States", // Default location
      api_key: process.env.SERPAPI_API_KEY,
    };

    const response = await getJson(params);
    const localResults = response["local_results"];

    if (!localResults || localResults.length === 0) {
      return res.status(200).json([]); // Return empty if no results
    }

    // --- Transformation Layer ---
    const transformedProducts = localResults.map(item => ({
      provider: 'serpapi',
      providerProductId: item.place_id,
      title: item.title,
      imageUrl: item.thumbnail,
      rating: item.rating,
      reviewCount: item.reviews,
      price: item.price ? parseFloat(item.price.replace(/[^0-9.-]+/g,"")) : undefined,
      address: item.address,
      providerDetails: {
        type: item.type,
        gps_coordinates: item.gps_coordinates,
      },
    }));

    // --- Validation Layer ---
    const validationResult = CanonicalProductSchema.array().safeParse(transformedProducts);

    if (!validationResult.success) {
      console.error("SerpApi data failed validation:", validationResult.error);
      // In a real app, you might want to alert on this, but still send the data that did pass,
      // or filter out the invalid items. For now, we send what we have.
      return res.status(500).json({
        error: "Data from provider failed validation.",
        details: validationResult.error.issues
      });
    }

    res.status(200).json(validationResult.data);

  } catch (error) {
    console.error("Error calling SerpApi:", error.message);
    res.status(500).json({ error: "Failed to fetch data from SerpApi." });
  }
});


app.listen(PORT, () => {
  console.log(`SerpApi Connector is running on http://localhost:${PORT}`);
});
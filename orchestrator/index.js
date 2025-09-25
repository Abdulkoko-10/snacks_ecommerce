const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3002;

// Middlewares
app.use(cors());
app.use(express.json());

// A simple health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'orchestrator' });
});

const SERPAPI_CONNECTOR_URL = 'http://localhost:3001';

app.post('/api/v1/chat/message', async (req, res) => {
  const { text: userMessageText } = req.body;

  if (!userMessageText) {
    return res.status(400).json({ error: 'Bad Request: "text" is required in the request body.' });
  }

  try {
    // --- 1. Call the Connector ---
    const connectorResponse = await axios.post(`${SERPAPI_CONNECTOR_URL}/search`, {
      query: userMessageText,
    });

    const canonicalProducts = connectorResponse.data;

    if (!canonicalProducts || canonicalProducts.length === 0) {
      return res.status(200).json({
        fullText: "I couldn't find any results for that. Please try a different search!",
        recommendations: [],
      });
    }

    // --- 2. Transform Canonical Products into Chat Recommendations ---
    // This is where we map the rich CanonicalProduct into the simpler preview card for the chat UI.
    const recommendations = canonicalProducts.map(p => ({
      canonicalProductId: `${p.provider}-${p.providerProductId}`, // Create a unique ID
      preview: {
        title: p.title,
        image: p.imageUrl || '/default-product-image.png', // Fallback image
        rating: p.rating,
        minPrice: p.price,
        bestProvider: p.provider, // The provider is now dynamic
        eta: "15-30 min", // Placeholder ETA
        originSummary: [p.provider],
        details: p.address, // Using address as details for now
      },
      reason: `Found this result for "${userMessageText}" via ${p.provider}.`,
      meta: {
        generatedBy: "orchestrator-rule",
        confidence: 0.95,
      }
    }));

    // --- 3. Create the Final Payload ---
    const payload = {
      fullText: `I found ${recommendations.length} results for your search for "${userMessageText}". Here are the top ones:`,
      recommendations: recommendations,
    };

    res.status(200).json(payload);

  } catch (error) {
    console.error("Error in orchestrator calling connector:", error.message);
    // Check if the error is from the downstream service
    if (error.response) {
      return res.status(error.response.status).json({
        error: `Error from downstream service: ${error.response.data.error}`
      });
    }
    res.status(500).json({ error: 'An internal error occurred in the orchestrator.' });
  }
});


app.listen(PORT, () => {
  console.log(`Orchestrator service is running on http://localhost:${PORT}`);
});
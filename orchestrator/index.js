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

const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: `You are a query understanding system for a food discovery app.
Your task is to analyze the user's message and extract key entities to form a search query.
You must return a single, valid JSON object with the following structure and nothing else:
{
  "search_query": "A concise, effective search query for a local search engine (e.g., 'best spicy pizza', 'cheap tacos', 'ramen'). This should be a string.",
  "location": "The city or neighborhood the user mentioned. If not specified, default to 'Austin, TX'. This should be a string.",
  "conversational_response": "A friendly, conversational response confirming what you are searching for. This should be a string."
}
Do not include any other text, explanations, or markdown formatting like \`\`\`json. Just the raw JSON object.`,
});

const generationConfig = {
  temperature: 0.2,
  topP: 1,
  topK: 32,
  maxOutputTokens: 4096,
  responseMimeType: "application/json",
};

app.post('/api/v1/chat/message', async (req, res) => {
  const { text: userMessageText } = req.body;

  if (!userMessageText) {
    return res.status(400).json({ error: 'Bad Request: "text" is required in the request body.' });
  }

  try {
    // --- 1. Understand User Intent with Gemini ---
    const chat = model.startChat({ generationConfig });
    const result = await chat.sendMessage(userMessageText);
    const responseJson = result.response.text();
    const intent = JSON.parse(responseJson);

    // --- 2. Call the Connector with the structured query ---
    const connectorResponse = await axios.post(`${SERPAPI_CONNECTOR_URL}/search`, {
      query: intent.search_query,
      location: intent.location,
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
      reason: `I found this based on your request for "${intent.search_query}".`,
      meta: {
        generatedBy: "gemini-instruct",
        confidence: 0.95,
      }
    }));

    // --- 3. Create the Final Payload ---
    const payload = {
      fullText: intent.conversational_response,
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


if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Orchestrator service is running on http://localhost:${PORT}`);
  });
}

module.exports = app; // Export for testing
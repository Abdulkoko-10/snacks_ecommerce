const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('Server configuration error: Missing GEMINI_API_KEY.');
}

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: { responseMimeType: "application/json" },
});

/**
 * Extracts structured search intent from a natural language query.
 * @param {string} query - The user's natural language query.
 * @returns {Promise<object>} A structured object representing the search intent.
 */
async function extractSearchIntent(query) {
  const systemInstruction = `You are a search intent parser for a food discovery app. Your task is to analyze the user's query and extract key information into a structured JSON object.

The user's query may contain:
- A primary search term (e.g., "pizza", "sushi", "ramen").
- A location or region (e.g., "in London", "near Shoreditch").
- Descriptive adjectives (e.g., "spicy", "cheap", "vegan", "romantic").
- A desired cuisine type (e.g., "italian", "japanese").

Your output MUST be a valid JSON object with the following keys:
- "query": The core food item or restaurant type (e.g., "pizza", "tacos"). This should be cleaned up.
- "region": The city or neighborhood mentioned. Default to "london" if not specified.
- "filters": An object containing any descriptive filters. Examples: { "dietary": "vegan", "flavor": "spicy", "price": "cheap" }.

Example 1:
User Query: "Find cheap vegan pizza near shoreditch"
Your JSON output:
{
  "query": "vegan pizza",
  "region": "shoreditch",
  "filters": {
    "price": "cheap",
    "dietary": "vegan"
  }
}

Example 2:
User Query: "I want some spicy ramen"
Your JSON output:
{
  "query": "ramen",
  "region": "london",
  "filters": {
    "flavor": "spicy"
  }
}

Now, analyze the following user query and provide the JSON output.`;

  const chat = model.startChat({
    history: [{ role: 'user', parts: [{ text: systemInstruction }] }],
  });

  const result = await chat.sendMessage(query);
  let responseText = result.response.text();

  try {
    // Check if the response is wrapped in markdown code fences and extract the JSON content.
    const match = responseText.match(/```json\s*([\s\S]*?)\s*```/);
    if (match) {
      responseText = match[1];
    }
    return JSON.parse(responseText);
  } catch (error) {
    console.error("Error parsing Gemini's JSON response:", error, "Raw response:", responseText);
    // Fallback to a simple query structure if JSON parsing fails
    return { query, region: 'london', filters: {} };
  }
}

/**
 * Generates a personalized reason for recommending a product.
 * @param {object} product - The product being recommended.
 * @param {Array<object>} chatHistory - The history of the conversation.
 * @returns {Promise<string>} A personalized reason.
 */
async function generateRecommendationReasons(product, chatHistory) {
  const reasonModel = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    // No JSON mode needed here, we want a string
  });

  const systemInstruction = `You are a recommendation assistant. Your task is to generate a short, compelling, and personalized reason why a user might like a specific product, based on their chat history.

The user has been shown the following product:
- Name: ${product.title}
- Details: ${product.description || 'No details available.'}
- Price: ${product.price?.amount || 'N/A'}

Analyze the user's chat history to understand their preferences (e.g., likes, dislikes, mentioned cravings, budget).

Based on the chat history and the product details, generate a single, concise sentence (max 25 words) explaining why this product is a good match.

Focus on a key selling point that aligns with the user's expressed desires. For example:
- If they mentioned "spicy", you could say: "This has the fiery kick you were looking for."
- If they mentioned "budget", you could say: "A great value option that fits your budget."
- If they just had a similar item, you could say: "If you liked [previous item], you'll love this."

Do not use generic phrases like "Based on our conversation". Be direct and specific.`;

  const history = (chatHistory || [])
    .filter(msg => msg.role === 'user' || msg.role === 'assistant')
    .map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

  const chat = reasonModel.startChat({
    history: [{ role: 'user', parts: [{ text: systemInstruction }] }],
  });

  // We send a simple prompt to trigger the generation based on the system instruction and history.
  const result = await chat.sendMessage("Why is this a good recommendation?");
  return result.response.text();
}

module.exports = {
  extractSearchIntent,
  generateRecommendationReasons,
};

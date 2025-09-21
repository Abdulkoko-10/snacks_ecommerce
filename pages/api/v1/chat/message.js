// Using the new Google GenAI SDK.
// We use `require` to avoid ESM/CJS compatibility issues in the Next.js API route environment.
const { GoogleGenAI } = require('@google/genai');

// eslint-disable-next-line no-unused-vars
const { ChatMessage, ChatRecommendationPayload } = require('../../../../schemas/chat');

/**
 * Handles incoming chat messages, sends them to the Gemini API using the new SDK, and returns the response.
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse<({ message: ChatMessage, recommendationPayload: ChatRecommendationPayload | null }) | { error: string }>} res
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('ERROR: GEMINI_API_KEY environment variable is not set.');
    return res.status(500).json({ error: 'Server configuration error: Missing API key.' });
  }

  try {
    // Initialize the main AI client
    const genAI = new GoogleGenAI(apiKey);

    const { text: userMessageText } = req.body;

    if (!userMessageText) {
      return res.status(400).json({ error: 'Bad Request: "text" is required in the request body.' });
    }

    const prompt = `You are a helpful and friendly food discovery assistant. A user said: "${userMessageText}". Respond to them in a conversational way.`;

    // The new SDK uses a different pattern:
    // We call generateContent directly on the client's `models` service.
    const result = await genAI.models.generateContent({
        model: "gemini-1.5-pro-latest", // Using a valid, recent model name
        contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const response = await result.response;
    const geminiText = response.text();

    /** @type {ChatMessage} */
    const assistantMessage = {
      id: `asst_msg_${Date.now()}`,
      role: 'assistant',
      text: geminiText,
      createdAt: new Date().toISOString(),
    };

    res.status(200).json({ message: assistantMessage, recommendationPayload: null });

  } catch (error) {
    console.error('Error calling Gemini API with the new SDK:', error);
    res.status(500).json({ error: 'Failed to get response from AI service.' });
  }
}

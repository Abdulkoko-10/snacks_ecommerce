const { GoogleGenerativeAI } = require('@google/genai');
// eslint-disable-next-line no-unused-vars
const { ChatMessage, ChatRecommendationPayload } = require('../../../../schemas/chat');

// Initialize the Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Handles incoming chat messages, sends them to Gemini, and returns the response.
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse<({ message: ChatMessage, recommendationPayload: ChatRecommendationPayload | null }) | { error: string }>} res
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  // Securely check for the API key
  if (!process.env.GEMINI_API_KEY) {
    console.error('ERROR: GEMINI_API_KEY environment variable is not set.');
    return res.status(500).json({ error: 'Server configuration error: Missing API key.' });
  }

  try {
    const { text: userMessageText } = req.body;

    if (!userMessageText) {
      return res.status(400).json({ error: 'Bad Request: "text" is required in the request body.' });
    }

    // For text-only input, use the gemini-pro model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `You are a helpful and friendly food discovery assistant. A user said: "${userMessageText}". Respond to them in a conversational way.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const geminiText = response.text();

    /** @type {ChatMessage} */
    const assistantMessage = {
      id: `asst_msg_${Date.now()}`,
      role: 'assistant',
      text: geminiText,
      createdAt: new Date().toISOString(),
    };

    // For this initial integration, we are not generating recommendations yet.
    // The recommendationPayload will be null.
    res.status(200).json({ message: assistantMessage, recommendationPayload: null });

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ error: 'Failed to get response from AI service.' });
  }
}

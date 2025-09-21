// Note: We cannot use top-level import/require for @google/genai due to ESM/CJS compatibility issues
// in the Next.js API route environment. We will use a dynamic import() inside the handler.

// eslint-disable-next-line no-unused-vars
const { ChatMessage, ChatRecommendationPayload } = require('../../../../schemas/chat');


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
    // Dynamically import the GoogleGenerativeAI class
    const { GoogleGenerativeAI } = await import('@google/genai');

    // Initialize the Gemini client inside the handler
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
    // Check for a specific constructor error to give a more helpful message
    if (error instanceof TypeError && error.message.includes('is not a constructor')) {
        console.error("This might be an ESM/CJS compatibility issue with the @google/genai package.");
        return res.status(500).json({ error: 'Internal server error: Failed to initialize AI service.' });
    }
    res.status(500).json({ error: 'Failed to get response from AI service.' });
  }
}

// eslint-disable-next-line no-unused-vars
const { ChatMessage, ChatRecommendationPayload } = require('../../../../schemas/chat');

const GEMINI_API_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent`;

/**
 * Handles incoming chat messages, sends them to the Gemini REST API, and returns the response.
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
    const { text: userMessageText } = req.body;

    if (!userMessageText) {
      return res.status(400).json({ error: 'Bad Request: "text" is required in the request body.' });
    }

    const prompt = `You are a helpful and friendly food discovery assistant. A user said: "${userMessageText}". Respond to them in a conversational way.`;

    const requestBody = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    };

    const apiResponse = await fetch(`${GEMINI_API_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!apiResponse.ok) {
      const errorBody = await apiResponse.text();
      console.error('Gemini API request failed:', apiResponse.status, errorBody);
      throw new Error(`Gemini API request failed with status ${apiResponse.status}`);
    }

    const responseData = await apiResponse.json();

    // Safely access the text from the response
    const geminiText = responseData.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response.";

    /** @type {ChatMessage} */
    const assistantMessage = {
      id: `asst_msg_${Date.now()}`,
      role: 'assistant',
      text: geminiText,
      createdAt: new Date().toISOString(),
    };

    res.status(200).json({ message: assistantMessage, recommendationPayload: null });

  } catch (error) {
    console.error('Error in chat handler:', error);
    res.status(500).json({ error: 'Failed to get response from AI service.' });
  }
}

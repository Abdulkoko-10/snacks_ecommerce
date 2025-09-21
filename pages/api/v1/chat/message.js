import { getAuth } from '@clerk/nextjs/server';
import { MongoClient } from 'mongodb';
const { GoogleGenAI } = require('@google/genai');

// eslint-disable-next-line no-unused-vars
const { ChatMessage, ChatRecommendationPayload } = require('../../../../schemas/chat');

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'food-discovery';

/**
 * Handles incoming chat messages, sends them to the Gemini API, saves the conversation, and returns the response.
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse<({ message: ChatMessage, recommendationPayload: ChatRecommendationPayload | null }) | { error: string }>} res
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !uri) {
    console.error('Server configuration error: Missing API key or MONGODB_URI.');
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  const mongoClient = new MongoClient(uri);

  try {
    const { text: userMessageText, chatHistory } = req.body;

    if (!userMessageText) {
      return res.status(400).json({ error: 'Bad Request: "text" is required in the request body.' });
    }

    // --- Save user message ---
    const userMessage = {
      id: `user_msg_${Date.now()}`,
      role: 'user',
      text: userMessageText,
      userId,
      threadId: userId, // Using userId as a simple threadId for now
      createdAt: new Date(),
    };

    await mongoClient.connect();
    const db = mongoClient.db(dbName);
    const collection = db.collection('chat_messages');
    await collection.insertOne(userMessage);

    // --- Call Gemini API ---
    const genAI = new GoogleGenAI(apiKey);

    // Convert our app's chat history to the format Gemini expects.
    // We also need to add the system prompt/instruction.
    const instruction = {
      role: "user", // Using 'user' role for the system instruction as per some examples
      parts: [{ text: "You are a helpful and friendly food discovery assistant. Please respond to the user in a conversational way." }],
    };
    const history = chatHistory
      .filter(msg => msg.role === 'user' || msg.role === 'assistant') // Filter out system messages
      .map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model', // Map our 'assistant' role to 'model'
        parts: [{ text: msg.text }],
      }));

    // The last message is the new user prompt, which is already in the history.
    const contents = [instruction, ...history];

    const result = await genAI.models.generateContent({
        model: "gemini-2.5-pro",
        contents: contents,
    });
    const geminiText = result.text;

    // TODO: This is a placeholder. In a future step, this would be dynamically generated
    // by another call to the Gemini API or a search in the vector DB.
    const recommendationPayload = null;

    // --- Save assistant message ---
    const assistantMessage = {
      id: `asst_msg_${Date.now()}`,
      role: 'assistant',
      text: geminiText,
      userId,
      threadId: userId,
      createdAt: new Date(),
      // Embed the recommendation payload if it exists, so we can retrieve it with the history
      ...(recommendationPayload && { recommendationPayload }),
    };
    await collection.insertOne(assistantMessage);


    res.status(200).json({ message: assistantMessage, recommendationPayload });

  } catch (error) {
    console.error('Error in chat message handler:', error);
    res.status(500).json({ error: 'Failed to process chat message.' });
  } finally {
    await mongoClient.close();
  }
}

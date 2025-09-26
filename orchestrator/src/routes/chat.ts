import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { search as searchWithGeoapify } from '@fd/geoapify-connector';
import { CanonicalProduct } from '@fd/schemas';

const router = Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  systemInstruction: `You are a helpful and friendly food discovery assistant.
Your goal is to understand the user's request for food and respond in a conversational way.
Based on the user's message, you must determine two things:
1.  **intent**: Is the user asking to search for food? This could be direct ('find me pizza') or indirect ('I'm hungry for something spicy'). If they are, the intent is 'SEARCH'. If they are just chatting, the intent is 'CHAT'.
2.  **query**: If the intent is 'SEARCH', what is the most likely search query for a food discovery API? For example, if the user says 'I want to find a great place for ramen near me', the query should be 'ramen'. If they say 'I'm craving some spicy curry', the query could be 'spicy curry'.

You must respond with a JSON object containing the 'intent' and the 'query'. Do not add any other text or formatting.
Example 1: User says 'find me the best tacos in San Francisco'. You respond with: {"intent": "SEARCH", "query": "tacos"}
Example 2: User says 'hi how are you'. You respond with: {"intent": "CHAT", "query": null}
Example 3: User says 'I could really go for some pho right now'. You respond with: {"intent": "SEARCH", "query": "pho"}`
});

router.post('/message', async (req, res) => {
  const { text, chatHistory, threadId, lat, lon } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Message text is required.' });
  }

  const newThreadId = threadId || uuidv4();
  res.setHeader('X-Thread-Id', newThreadId);

  try {
    const chat = model.startChat();
    const result = await chat.sendMessage(text);
    const response = await result.response;
    const aiResponseText = response.text();

    let intentData;
    try {
      intentData = JSON.parse(aiResponseText);
    } catch (e) {
      console.error("Failed to parse AI response JSON:", aiResponseText);
      const chatModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const chatResponse = await chatModel.generateContent(`Continue the conversation. The user said: "${text}"`);
      return res.status(200).json({
        fullText: chatResponse.response.text(),
        recommendations: [],
      });
    }

    if (intentData.intent === 'SEARCH' && intentData.query) {
      if (!lat || !lon) {
        return res.status(200).json({
          fullText: "It sounds like you're looking for food! To help me find the best options, could you please share your location?",
          recommendations: [],
        });
      }
      const searchResults = await searchWithGeoapify(intentData.query, lat, lon);
      const recommendationText = searchResults.length > 0
        ? `I found a few options for "${intentData.query}" near you!`
        : `I couldn't find any results for "${intentData.query}" near you, but you might like these other options.`;

      return res.status(200).json({
        fullText: recommendationText,
        recommendations: searchResults,
      });

    } else {
      const chatModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const chatResponse = await chatModel.generateContent(`Continue the conversation. The user said: "${text}"`);
      return res.status(200).json({
        fullText: chatResponse.response.text(),
        recommendations: [],
      });
    }

  } catch (error) {
    console.error("Error in chat message handler:", error);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
});

export default router;
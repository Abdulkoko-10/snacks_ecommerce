import { getAuth } from '@clerk/nextjs/server';
import { ObjectId } from 'mongodb';
import clientPromise from '../../../../lib/mongodb';
const { GoogleGenAI } = require('@google/genai');

// eslint-disable-next-line no-unused-vars
const { ChatMessage, ChatRecommendationPayload } = require('../../../../schemas/chat');

const dbName = process.env.MONGODB_DB_NAME || 'food-discovery';

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
  if (!apiKey) {
    console.error('Server configuration error: Missing API key.');
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  try {
    const { text: userMessageText, chatHistory, threadId: currentThreadId } = req.body;

    if (!userMessageText) {
      return res.status(400).json({ error: 'Bad Request: "text" is required in the request body.' });
    }

    let threadId = currentThreadId;
    let isNewThread = !threadId;
    if (isNewThread) {
      threadId = new ObjectId().toString();
    }

    res.setHeader('Content-Type', 'application/x-ndjson');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Thread-Id', threadId); // Send threadId back as a header

    const sendEvent = (type, payload) => {
      res.write(JSON.stringify({ type, payload }) + '\n');
    };

    // --- Start Streaming AI Response ---
    const genAI = new GoogleGenAI(apiKey);
    const model = "gemini-1.5-flash"; // Using a more recent model

    // A more sophisticated prompt that asks for JSON when it finds food.
    const instruction = {
      role: "user", // IMPORTANT: Gemini API requires 'user' or 'model' role, not 'system'
      parts: [{
        text: `You are Koko, a friendly and direct food discovery assistant.
        - Your goal is to help users find food they'll love.
        - Be friendly, but get straight to the point. Avoid conversational fluff or asking clarifying questions.
        - If the user asks for a recommendation, provide it immediately.
        - Accompany the recommendation with a single, brief, friendly sentence.
        - When you recommend a specific food item, embed a JSON object in your response.
        - The JSON object must be on its own line and start with '<<<JSON'.
        - Example of a good response: "I'd recommend trying the 'Spicy Tuna Roll', it's a local favorite!
        <<<JSON
        {
          "recommendations": [{
            "canonicalProductId": "sushi-123",
            "reason": "A classic and widely loved choice, this chicken shawarma offers a balanced flavor profile.",
            "preview": { "title": "Spicy Tuna Roll", "image": "/sushi-preview.jpg", "rating": 4.8, "minPrice": 12.99 }
          }]
        }
        JSON>>>"`
      }]
    };

    const history = (chatHistory || [])
      .filter(msg => msg.role === 'user' || msg.role === 'assistant')
      .map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));
    history.push({ role: 'user', parts: [{ text: userMessageText }] });

    const contents = [instruction, ...history];
    const result = await generateWithRetry(genAI, model, contents);

    let fullResponseText = '';
    const recommendations = [];

    // Regex to find the JSON block
    const jsonRegex = /<<<JSON([\s\S]*?)JSON>>>/;

    for await (const chunk of result) {
      // Correctly access the text from the chunk
      let chunkText = chunk.text;
      if (typeof chunk.text !== 'function') {
          chunkText = chunk.text;
      } else {
          chunkText = chunk.text();
      }


      // Check if the chunk contains our special JSON block
      const match = chunkText.match(jsonRegex);
      if (match && match[1]) {
        try {
          const jsonPayload = JSON.parse(match[1]);
          if (jsonPayload.recommendations) {
            jsonPayload.recommendations.forEach(rec => {
              recommendations.push(rec); // Store for DB
              sendEvent('recommendation', rec);
            });
          }
          // Remove the JSON block from the text stream
          chunkText = chunkText.replace(jsonRegex, '').trim();
        } catch (e) {
          console.error("Failed to parse recommendation JSON:", e);
          // Don't send a broken event, just send the text
        }
      }

      if (chunkText) {
        fullResponseText += chunkText;
        sendEvent('text-chunk', chunkText);
      }
    }

    sendEvent('stream-end', { reason: 'completed' });
    res.end();

    // --- Perform Database Writes After Streaming ---
    const saveToDb = async () => {
      try {
        const client = await clientPromise;
        const db = client.db(dbName);
        const messagesCollection = db.collection('chat_messages');
        const threadsCollection = db.collection('threads');

        if (isNewThread) {
          await threadsCollection.insertOne({
            _id: new ObjectId(threadId),
            userId,
            title: userMessageText.substring(0, 50),
            createdAt: new Date(),
            lastUpdated: new Date(),
          });
        } else {
          await threadsCollection.updateOne({ _id: new ObjectId(threadId), userId }, { $set: { lastUpdated: new Date() } });
        }

        const userMessage = {
          id: `user_msg_${Date.now()}`,
          role: 'user',
          text: userMessageText,
          userId,
          threadId,
          createdAt: new Date(),
        };

        const assistantMessage = {
          id: `asst_msg_${Date.now()}`,
          role: 'assistant',
          text: fullResponseText,
          recommendations: recommendations, // Save recommendations to DB
          userId,
          threadId,
          createdAt: new Date(),
        };

        await messagesCollection.insertOne(userMessage);
        await messagesCollection.insertOne(assistantMessage);
      } catch (dbError) {
        console.error("Error saving chat conversation to DB:", dbError);
      }
    };

    saveToDb();

  } catch (error) {
    console.error('Error in chat message handler:', error);
    // If headers are not sent, we can send an error response.
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to process chat message.' });
    }
  }
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function generateWithRetry(genAI, model, contents, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await genAI.models.generateContentStream({ model, contents });
      return result; // Success
    } catch (error) {
      if (error.status === 503 && i < maxRetries - 1) {
        const waitTime = Math.pow(2, i) * 1000; // Exponential backoff: 1s, 2s, 4s
        console.warn(`Gemini API overloaded. Retrying in ${waitTime / 1000}s... (Attempt ${i + 1}/${maxRetries})`);
        await delay(waitTime);
      } else {
        throw error; // Re-throw if it's not a 503 or if it's the last retry
      }
    }
  }
}

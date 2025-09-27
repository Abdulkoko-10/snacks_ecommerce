const { ObjectId } = require('mongodb');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const clientPromise = require('../lib/mongodb');

const DB_NAME = process.env.MONGODB_DB_NAME || 'food-discovery-orchestrator';

// Helper to construct the base URL for inter-service communication
const getBaseUrl = () => {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000'; // Fallback for local development
};

function initializeSocket(io) {
  // Pre-flight check for essential configuration
  const isDbConnected = !!clientPromise;
  const hasGeminiKey = !!process.env.GEMINI_API_KEY;

  io.on('connection', (socket) => {
    console.log(`A user connected: ${socket.id}`);

    // Immediately check for server readiness on connection
    if (!isDbConnected) {
      socket.emit('chat_error', { message: 'Service Unavailable: Database not configured.' });
      socket.disconnect(true);
      return;
    }
    if (!hasGeminiKey) {
        socket.emit('chat_error', { message: 'Service Unavailable: AI service not configured.' });
        socket.disconnect(true);
        return;
    }

    socket.on('chat_message', async (data) => {
      const { text: userMessageText, chatHistory, threadId: currentThreadId } = data;
      const userId = 'user_placeholder';
      const apiKey = process.env.GEMINI_API_KEY; // We know this exists from the check above

      if (!userMessageText) {
        socket.emit('chat_error', { message: 'Message text is required.' });
        return;
      }

      let threadId = currentThreadId;
      let isNewThread = !threadId;
      if (isNewThread) {
        threadId = new ObjectId().toString();
        socket.emit('thread_created', { threadId });
      }

      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const history = (chatHistory || []).filter(msg => msg.role !== 'system').map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }],
        }));
        const chat = model.startChat({ history });
        const result = await chat.sendMessage(userMessageText);
        const fullResponseText = result.response.text();

        let recommendations = [];
        try {
          const connectorUrl = `${getBaseUrl()}/api/connectors/serpapi/search`;
          console.log(`Fetching recommendations from SerpApi at ${connectorUrl} for query: "${userMessageText}"`);
          const serpApiResponse = await axios.post(connectorUrl, {
            query: userMessageText,
          });
          recommendations = serpApiResponse.data.slice(0, 3); // Take top 3 results
        } catch (recommendationError) {
          console.error('Error fetching recommendations from SerpApi connector:', recommendationError.message);
        }

        const payload = { fullText: fullResponseText, recommendations };
        socket.emit('ai_response', payload);

        // Intentionally not awaiting this for faster response time
        (async () => {
            try {
                const messagesCollection = db.collection('chat_messages');
                const threadsCollection = db.collection('threads');
                if (isNewThread) {
                    await threadsCollection.insertOne({ _id: new ObjectId(threadId), userId, title: userMessageText.substring(0, 50), createdAt: new Date(), lastUpdated: new Date() });
                } else {
                    await threadsCollection.updateOne({ _id: new ObjectId(threadId) }, { $set: { lastUpdated: new Date() } });
                }
                const userMessage = { role: 'user', text: userMessageText, userId, threadId, createdAt: new Date() };
                const assistantMessage = { role: 'assistant', text: fullResponseText, userId, threadId, createdAt: new Date() };
                await messagesCollection.insertMany([userMessage, assistantMessage]);
                console.log(`Saved messages for thread ${threadId}`);
            } catch (dbError) {
                console.error("Error during async DB write:", dbError);
            }
        })();

      } catch (error) {
        console.error(`Error handling chat message for thread ${threadId}:`, error);
        socket.emit('chat_error', { message: 'Failed to process chat message.' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
}

module.exports = { initializeSocket };
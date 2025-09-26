const { ObjectId } = require('mongodb');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const clientPromise = require('../lib/mongodb');

const DB_NAME = process.env.MONGODB_DB_NAME || 'food-discovery-orchestrator';

function initializeSocket(io) {
  io.on('connection', (socket) => {
    console.log(`A user connected: ${socket.id}`);

    socket.on('chat_message', async (data) => {
      const { text: userMessageText, chatHistory, threadId: currentThreadId } = data;
      const userId = 'user_placeholder';
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        console.error('Server config error: Missing GEMINI_API_KEY.');
        socket.emit('chat_error', { message: 'Server configuration error.' });
        return;
      }
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

        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const recommendations = await db.collection('canonical_products').find({}).limit(3).toArray();

        const payload = { fullText: fullResponseText, recommendations };
        socket.emit('ai_response', payload);

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
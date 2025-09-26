const express = require('express');
const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');
const { ObjectId } = require('mongodb');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const clientPromise = require('./lib/mongodb');

const app = express();
app.use(express.json());

// --- Service Configuration ---
const DB_NAME = process.env.MONGODB_DB_NAME || 'food-discovery-orchestrator';

// --- Health Check Endpoint ---
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// --- Authentication Middleware Stub ---
const requireAuth = (req, res, next) => {
    console.log('Authentication middleware stub: Bypassing auth for development.');
    next();
};

// --- API Routes ---
const apiRouter = express.Router();
apiRouter.use(requireAuth);

apiRouter.get('/search', async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const products = await db.collection('canonical_products').find({}).limit(20).toArray();
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products from DB:', error);
    res.status(500).json({ error: 'Failed to fetch data from database.' });
  }
});

apiRouter.get('/product/:slug', async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const { slug } = req.params;

    // Find the product by its slug, which is the public identifier.
    const product = await db.collection('canonical_products').findOne({ 'preview.slug': slug });

    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error(`Error fetching product by slug (${req.params.slug}):`, error);
    res.status(500).json({ error: 'Failed to fetch data from database.' });
  }
});

apiRouter.post('/chat/recommend', (req, res) => {
  res.json({ message: 'Chat recommendation endpoint stub' });
});

// --- Ingestion Endpoint ---
const ingestRouter = express.Router();

async function canonicalizeAndStore(db, provider, products) {
  const collection = db.collection('canonical_products');
  const operations = products.map(product => {
    const filter = {
      'meta.provider': provider,
      'meta.providerProductId': product.canonicalProductId
    };
    const update = {
      $set: { ...product, 'meta.provider': provider, 'meta.providerProductId': product.canonicalProductId, lastIngestedAt: new Date() },
      $setOnInsert: { createdAt: new Date() }
    };
    return { updateOne: { filter, update, upsert: true } };
  });
  if (operations.length === 0) return { acknowledged: true, upsertedCount: 0, modifiedCount: 0 };
  return await collection.bulkWrite(operations);
}

ingestRouter.post('/provider-data', async (req, res) => {
    const { provider, products } = req.body;
    if (!provider || !Array.isArray(products)) {
        return res.status(400).json({ error: 'Request body must include a "provider" string and a "products" array.' });
    }
    try {
        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const result = await canonicalizeAndStore(db, provider, products);
        res.status(201).json({ message: 'Data ingested successfully.', result });
    } catch (error) {
        console.error('Error during data ingestion:', error);
        res.status(500).json({ error: 'Failed to ingest data.' });
    }
});

app.use('/api/v1', apiRouter);
app.use('/api/v1/ingest', ingestRouter);

// --- Chat Router ---
const chatRouter = express.Router();
chatRouter.use(requireAuth); // Apply auth to all chat routes

chatRouter.get('/threads', async (req, res) => {
    // Note: In a real implementation, we would get the userId from the authenticated session.
    // const { userId } = req.auth;
    // For now, we'll proceed without user-specific filtering for demonstration.
    try {
        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const threads = await db.collection('threads').find({}).sort({ lastUpdated: -1 }).toArray();
        res.status(200).json(threads);
    } catch (error) {
        console.error('Error fetching chat threads:', error);
        res.status(500).json({ error: 'Failed to fetch chat threads.' });
    }
});

chatRouter.delete('/threads/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { ObjectId } = require('mongodb');

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid thread ID format.' });
        }

        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const result = await db.collection('threads').deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Thread not found.' });
        }

        await db.collection('chat_messages').deleteMany({ threadId: id });

        res.status(200).json({ message: 'Thread deleted successfully.' });
    } catch (error) {
        console.error(`Error deleting thread ${req.params.id}:`, error);
        res.status(500).json({ error: 'Failed to delete thread.' });
    }
});

chatRouter.put('/threads/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title } = req.body;
        const { ObjectId } = require('mongodb');

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid thread ID format.' });
        }
        if (!title) {
            return res.status(400).json({ error: 'Title is required.' });
        }

        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const result = await db.collection('threads').updateOne(
            { _id: new ObjectId(id) },
            { $set: { title: title, lastUpdated: new Date() } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Thread not found.' });
        }

        res.status(200).json({ message: 'Thread renamed successfully.' });
    } catch (error) {
        console.error(`Error renaming thread ${req.params.id}:`, error);
        res.status(500).json({ error: 'Failed to rename thread.' });
    }
});

chatRouter.get('/history', async (req, res) => {
    try {
        const { threadId } = req.query;
        if (!threadId) {
            return res.status(400).json({ error: 'threadId query parameter is required.' });
        }

        const client = await clientPromise;
        const db = client.db(DB_NAME);

        // In a real app, we would also filter by the authenticated userId
        // const { userId } = req.auth;
        // const query = { threadId, userId };
        const query = { threadId };

        const messages = await db.collection('chat_messages').find(query).sort({ createdAt: 1 }).toArray();

        // The original API returns a more complex object. We will replicate that here for compatibility.
        const recommendationsByMessageId = {};
        messages.forEach(message => {
            if (message.role === 'assistant' && message.recommendationPayload) {
                recommendationsByMessageId[message.id] = message.recommendationPayload.recommendations;
                delete message.recommendationPayload; // Clean up payload
            }
        });

        res.status(200).json({ messages, recommendationsByMessageId });
    } catch (error) {
        console.error(`Error fetching history for thread ${req.query.threadId}:`, error);
        res.status(500).json({ error: 'Failed to fetch chat history.' });
    }
});

chatRouter.post('/message', async (req, res) => {
    // Note: In a real app, userId would come from req.auth after Clerk validation
    const userId = 'user_placeholder'; // Placeholder
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error('Server configuration error: Missing GEMINI_API_KEY.');
        return res.status(500).json({ error: 'Server configuration error.' });
    }

    try {
        const { text: userMessageText, chatHistory, threadId: currentThreadId } = req.body;

        if (!userMessageText) {
            return res.status(400).json({ error: 'Bad Request: "text" is required.' });
        }

        let threadId = currentThreadId;
        let isNewThread = !threadId;
        if (isNewThread) {
            threadId = new ObjectId().toString();
        }
        res.setHeader('X-Thread-Id', threadId);

        // 1. Generate AI Response
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const history = (chatHistory || []).filter(msg => msg.role !== 'system').map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }],
        }));
        const chat = model.startChat({ history });
        const result = await chat.sendMessage(userMessageText);
        const fullResponseText = result.response.text();

        // 2. Fetch Product Recommendations from our own DB
        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const recommendations = await db.collection('canonical_products').find({}).limit(3).toArray();

        // 3. Send Response Payload
        const payload = { fullText: fullResponseText, recommendations };
        res.status(200).json(payload);

        // 4. Perform Database Writes Asynchronously
        const saveToDb = async () => {
            try {
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
                    await threadsCollection.updateOne({ _id: new ObjectId(threadId) }, { $set: { lastUpdated: new Date() } });
                }

                const userMessage = { role: 'user', text: userMessageText, userId, threadId, createdAt: new Date() };
                const assistantMessage = { role: 'assistant', text: fullResponseText, userId, threadId, createdAt: new Date() };
                await messagesCollection.insertMany([userMessage, assistantMessage]);

            } catch (dbError) {
                console.error("Error saving chat conversation to DB:", dbError);
            }
        };
        saveToDb();

    } catch (error) {
        console.error('Error in chat message handler:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to process chat message.' });
        }
    }
});

app.use('/api/v1/chat', chatRouter);

module.exports = app;
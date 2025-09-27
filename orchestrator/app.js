const express = require('express');
const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');
const { ObjectId } = require('mongodb');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const clientPromise = require('./lib/mongodb');

const app = express();
app.use(express.json());

// --- Service Configuration & Middleware ---
const DB_NAME = process.env.MONGODB_DB_NAME || 'food-discovery-orchestrator';
const SERPAPI_CONNECTOR_URL = process.env.SERPAPI_CONNECTOR_URL;

const checkDbConnection = (req, res, next) => {
  if (!clientPromise) {
    return res.status(503).json({ error: 'Service Unavailable: Database connection is not configured. Check MONGODB_URI environment variable.' });
  }
  next();
};

const checkGeminiApiKey = (req, res, next) => {
    if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({ error: 'Service Unavailable: Gemini API key is not configured. Check GEMINI_API_KEY environment variable.' });
    }
    next();
};

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

const requireAuth = (req, res, next) => {
    console.log('Authentication middleware stub: Bypassing auth for development.');
    next();
};

// --- API Routes ---
const apiRouter = express.Router();
apiRouter.use(requireAuth);

const checkSerpApiConnector = (req, res, next) => {
  if (!SERPAPI_CONNECTOR_URL) {
    return res.status(503).json({ error: 'Service Unavailable: SerpApi Connector URL is not configured. Check SERPAPI_CONNECTOR_URL environment variable.' });
  }
  next();
};

apiRouter.get('/search', checkSerpApiConnector, async (req, res) => {
  try {
    const { q, location } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Search query (q) is required.' });
    }

    const response = await axios.post(SERPAPI_CONNECTOR_URL, {
      query: q,
      location: location,
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error calling SerpApi Connector:', error.message);
    res.status(500).json({ error: 'Failed to fetch data from search provider.' });
  }
});

apiRouter.get('/product/:canonicalId', checkDbConnection, async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const { canonicalId } = req.params;
    const product = await db.collection('canonical_products').findOne({ canonicalProductId: canonicalId });
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error(`Error fetching product by id (${req.params.canonicalId}):`, error);
    res.status(500).json({ error: 'Failed to fetch data from database.' });
  }
});

// --- Ingestion Endpoint ---
const ingestRouter = express.Router();
ingestRouter.post('/provider-data', checkDbConnection, async (req, res) => {
    const { provider, products } = req.body;
    if (!provider || !Array.isArray(products)) {
        return res.status(400).json({ error: 'Request body must include a "provider" string and a "products" array.' });
    }
    try {
        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const collection = db.collection('canonical_products');
        const operations = products.map(product => ({
            updateOne: {
                filter: { canonicalProductId: product.canonicalProductId },
                update: { $set: { ...product, lastIngestedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
                upsert: true,
            },
        }));
        if (operations.length === 0) {
            return res.status(200).json({ message: 'No products to ingest.' });
        }
        const result = await collection.bulkWrite(operations);
        res.status(201).json({ message: 'Data ingested successfully.', result });
    } catch (error) {
        console.error('Error during data ingestion:', error);
        res.status(500).json({ error: 'Failed to ingest data.' });
    }
});

// --- Chat Router ---
const chatRouter = express.Router();
chatRouter.use(requireAuth, checkDbConnection); // Check DB for all chat routes

chatRouter.get('/threads', async (req, res) => {
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
        if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid thread ID format.' });

        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const result = await db.collection('threads').deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) return res.status(404).json({ error: 'Thread not found.' });

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
        if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid thread ID format.' });
        if (!title) return res.status(400).json({ error: 'Title is required.' });

        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const result = await db.collection('threads').updateOne({ _id: new ObjectId(id) }, { $set: { title, lastUpdated: new Date() } });
        if (result.matchedCount === 0) return res.status(404).json({ error: 'Thread not found.' });

        res.status(200).json({ message: 'Thread renamed successfully.' });
    } catch (error) {
        console.error(`Error renaming thread ${req.params.id}:`, error);
        res.status(500).json({ error: 'Failed to rename thread.' });
    }
});

chatRouter.get('/history', async (req, res) => {
    try {
        const { threadId } = req.query;
        if (!threadId) return res.status(400).json({ error: 'threadId query parameter is required.' });

        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const messages = await db.collection('chat_messages').find({ threadId }).sort({ createdAt: 1 }).toArray();

        const recommendationsByMessageId = {};
        messages.forEach(message => {
            if (message.role === 'assistant' && message.recommendationPayload) {
                recommendationsByMessageId[message.id] = message.recommendationPayload.recommendations;
                delete message.recommendationPayload;
            }
        });
        res.status(200).json({ messages, recommendationsByMessageId });
    } catch (error) {
        console.error(`Error fetching history for thread ${req.query.threadId}:`, error);
        res.status(500).json({ error: 'Failed to fetch chat history.' });
    }
});

// Apply Routers
app.use('/api/v1', apiRouter);
app.use('/api/v1/ingest', ingestRouter);
app.use('/api/v1/chat', chatRouter);

module.exports = app;
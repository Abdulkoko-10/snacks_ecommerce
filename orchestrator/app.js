const express = require('express');
const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');
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

app.use('/api/v1/chat', chatRouter);

module.exports = app;
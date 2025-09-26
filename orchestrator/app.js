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

apiRouter.get('/product/:id', (req, res) => {
  res.json({ message: `Product endpoint stub for ID: ${req.params.id}` });
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

module.exports = app;
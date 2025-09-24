import express from 'express';
import cors from 'cors';
import { CanonicalProduct } from '@fd/schemas';

const app = express();
const port = 3001;

// NOTE: This is a temporary in-memory store for proof-of-concept purposes.
// In a real application, this would be replaced with a persistent database like MongoDB or Firestore.
let productStore: CanonicalProduct[] = [];

// Setup CORS to allow the frontend to make requests
const allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json());

// Global request logger for debugging
app.use((req, res, next) => {
  console.log(`[Orchestrator] Request received: ${req.method} ${req.url}`);
  next();
});

// Simple Canonicalizer module
const canonicalizer = {
  process: (product: CanonicalProduct) => {
    const exists = productStore.some(p => p.canonicalProductId === product.canonicalProductId);

    if (!exists) {
      console.log(`[Canonicalizer] New product found. Adding to store: ${product.canonicalProductId}`);
      productStore.push(product);
    } else {
      console.log(`[Canonicalizer] Product already exists. Skipping: ${product.canonicalProductId}`);
    }
  }
};

// API endpoint for frontend to fetch products
app.get('/api/v1/products', (req, res) => {
  console.log(`[API] Serving ${productStore.length} products to frontend.`);
  res.json(productStore);
});

// API endpoint for connectors to push data
app.post('/api/v1/ingest', (req, res) => {
  const { provider, products } = req.body;

  if (!provider || !Array.isArray(products)) {
    console.log(`[API Error] Invalid payload from ${req.ip}. "provider" and "products" array are required.`);
    return res.status(400).json({ error: 'Invalid payload. "provider" and "products" array are required.' });
  }

  console.log(`[Ingest] Received ${products.length} products from provider: ${provider}`);

  for (const product of products) {
    canonicalizer.process(product as CanonicalProduct);
  }

  res.status(202).json({ message: 'Data accepted for processing.' });
});

app.listen(port, () => {
  console.log(`Orchestrator service listening on http://localhost:${port}`);
});

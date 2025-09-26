const express = require('express');
const express = require('express');
const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');
const axios = require('axios');

// --- Service Configuration ---
const SANITY_CONNECTOR_URL = process.env.SANITY_CONNECTOR_URL || 'http://localhost:3002';

// --- Secrets Management Stub ---
// In a real application, secrets would be loaded from a secure vault (e.g., Doppler, HashiCorp Vault)
// For now, we'll rely on environment variables.
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
if (!CLERK_SECRET_KEY) {
  console.warn('Warning: CLERK_SECRET_KEY is not set. Authentication will not work.');
}

const PORT = process.env.ORCHESTRATOR_PORT || 3001;

const app = express();
app.use(express.json());

// --- Health Check Endpoint ---
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// --- Authentication Middleware Stub ---
// This middleware will protect all routes defined after it.
// We are using a simple stub here. In a real implementation, you would configure Clerk properly.
const requireAuth = (req, res, next) => {
    // This is a placeholder for the actual Clerk middleware.
    // The real middleware would be: ClerkExpressRequireAuth({ secretKey: CLERK_SECRET_KEY })
    console.log('Authentication middleware stub: Bypassing auth for development.');
    next();
};


// --- API Routes (Stubs for Phase 1) ---
const apiRouter = express.Router();
apiRouter.use(requireAuth); // Apply auth to all v1 routes

apiRouter.get('/search', async (req, res) => {
  try {
    // Call the Sanity connector to get products
    const response = await axios.get(`${SANITY_CONNECTOR_URL}/products`);
    const products = response.data;

    // The data is already in the canonical format, so we can just return it
    res.status(200).json(products);
  } catch (error) {
    console.error('Error calling Sanity connector from orchestrator:', error.message);
    // Forward a generic error to the client
    res.status(502).json({ error: 'Failed to fetch data from a downstream service.' });
  }
});

apiRouter.get('/product/:id', (req, res) => {
  res.json({ message: `Product endpoint stub for ID: ${req.params.id}` });
});

apiRouter.post('/chat/recommend', (req, res) => {
  res.json({ message: 'Chat recommendation endpoint stub' });
});

app.use('/api/v1', apiRouter);


// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Orchestrator service listening on port ${PORT}`);
});
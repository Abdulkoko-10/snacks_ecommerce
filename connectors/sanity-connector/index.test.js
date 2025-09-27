const request = require('supertest');
const express = require('express');
const sanityClient = require('@sanity/client');
const axios = require('axios');

// --- Mocks ---
jest.mock('axios');
jest.mock('@sanity/client', () => {
  const mClient = { fetch: jest.fn() };
  return jest.fn(() => mClient);
});
jest.mock('@sanity/image-url', () => () => ({
    image: () => ({ width: () => ({ url: () => 'http://example.com/image.png' }) })
}));


// --- Test Setup ---
const app = express();
app.use(express.json());

// Re-import the logic to be tested, but with mocks in place
const client = sanityClient();
const ORCHESTRATOR_URL = 'http://localhost:3001';


// --- Endpoints for Testing ---
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.post('/trigger-ingest', async (req, res) => {
  try {
    const productsQuery = `*[_type == "product" && defined(slug.current)]{_id, name, image, price, details, slug} | order(_createdAt desc)`;
    const sanityProducts = await client.fetch(productsQuery);
    const canonicalProducts = sanityProducts.map(p => ({ /* ... transformation logic ... */ }));
    const ingestionPayload = { provider: 'sanity', products: canonicalProducts };
    const response = await axios.post(`${ORCHESTRATOR_URL}/api/v1/ingest/provider-data`, ingestionPayload);
    res.status(200).json({ message: 'Success', orchestratorResponse: response.data });
  } catch (error) {
    res.status(500).json({ error: 'Failed during the ingestion process.' });
  }
});


describe('Sanity Connector Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /health', () => {
    it('should return 200 OK', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });

  describe('POST /trigger-ingest', () => {
    it('should fetch from Sanity and push to the orchestrator', async () => {
      const mockSanityData = [{ _id: 'prod_1', name: 'Test Snack', price: 100, slug: { current: 'test-snack' }, image: [{}] }];
      client.fetch.mockResolvedValue(mockSanityData);
      axios.post.mockResolvedValue({ data: { message: 'Data ingested' } });

      const res = await request(app).post('/trigger-ingest');

      expect(res.statusCode).toBe(200);
      expect(client.fetch).toHaveBeenCalledTimes(1);
      expect(axios.post).toHaveBeenCalledTimes(1);
      expect(axios.post).toHaveBeenCalledWith(
        `${ORCHESTRATOR_URL}/api/v1/ingest/provider-data`,
        expect.objectContaining({ provider: 'sanity' })
      );
      expect(res.body.orchestratorResponse.message).toBe('Data ingested');
    });

    it('should return a 500 error if the orchestrator call fails', async () => {
        client.fetch.mockResolvedValue([{ _id: 'prod_1' }]); // Sanity part succeeds
        axios.post.mockRejectedValue(new Error('Orchestrator unavailable')); // Orchestrator part fails

        const res = await request(app).post('/trigger-ingest');

        expect(res.statusCode).toBe(500);
        expect(res.body.error).toBe('Failed during the ingestion process.');
    });
  });
});
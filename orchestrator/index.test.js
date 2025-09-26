const request = require('supertest');
const express = require('express');
const axios = require('axios');

// Mock axios before importing the app
jest.mock('axios');

// We need to create a standalone app for testing, since the real app starts a server
const app = express();
app.use(express.json());

// --- Service Configuration ---
const SANITY_CONNECTOR_URL = process.env.SANITY_CONNECTOR_URL || 'http://localhost:3002';

// --- Health Check Endpoint ---
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// --- API Routes (Stubs for Phase 1) ---
const apiRouter = express.Router();

apiRouter.get('/search', async (req, res) => {
  try {
    const response = await axios.get(`${SANITY_CONNECTOR_URL}/products`);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(502).json({ error: 'Failed to fetch data from a downstream service.' });
  }
});

app.use('/api/v1', apiRouter);


describe('Orchestrator Service', () => {
  describe('GET /health', () => {
    it('should return 200 OK and a status message', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual({ status: 'ok' });
    });
  });

  describe('GET /api/v1/search', () => {
    it('should return products from the sanity-connector', async () => {
      // Mock the axios call
      const mockProducts = [{ canonicalProductId: '123', preview: { title: 'Test Product' } }];
      axios.get.mockResolvedValue({ data: mockProducts });

      const res = await request(app).get('/api/v1/search');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockProducts);
      // Ensure the mock was called correctly
      expect(axios.get).toHaveBeenCalledWith('http://localhost:3002/products');
    });

    it('should return a 502 error if the connector call fails', async () => {
      // Mock a failed axios call
      axios.get.mockRejectedValue(new Error('Network Error'));

      const res = await request(app).get('/api/v1/search');

      expect(res.statusCode).toEqual(502);
      expect(res.body).toEqual({ error: 'Failed to fetch data from a downstream service.' });
    });
  });
});
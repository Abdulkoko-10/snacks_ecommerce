const request = require('supertest');

// Mock the MongoDB client and export the mock for use in tests
const mockDb = {
  collection: jest.fn().mockReturnThis(),
  find: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  toArray: jest.fn(),
  bulkWrite: jest.fn(),
};
const mockClientPromise = Promise.resolve({ db: () => mockDb });
jest.mock('./lib/mongodb', () => mockClientPromise);

// Re-require the app logic after mocks are in place
const app = require('./app');

describe('Orchestrator Service', () => {

  beforeEach(() => {
    // Clear all mocks on the mockDb object before each test
    for (const key in mockDb) {
      if (jest.isMockFunction(mockDb[key])) {
        mockDb[key].mockClear();
      }
    }
  });

  describe('GET /health', () => {
    it('should return 200 OK and a status message', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual({ status: 'ok' });
    });
  });

  describe('GET /api/v1/search', () => {
    it('should return products from the database', async () => {
      const mockProducts = [{ canonicalProductId: 'db_prod_1', preview: { title: 'DB Product' } }];
      mockDb.toArray.mockResolvedValue(mockProducts);

      const res = await request(app).get('/api/v1/search');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockProducts);
      expect(mockDb.collection).toHaveBeenCalledWith('canonical_products');
      expect(mockDb.find).toHaveBeenCalledWith({});
    });

    it('should return a 500 error if the database call fails', async () => {
        mockDb.toArray.mockRejectedValue(new Error('DB Error'));

        const res = await request(app).get('/api/v1/search');

        expect(res.statusCode).toEqual(500);
        expect(res.body).toEqual({ error: 'Failed to fetch data from database.' });
    });
  });

  describe('POST /api/v1/ingest/provider-data', () => {
    it('should ingest data successfully and return a 201 status', async () => {
        const ingestionData = {
            provider: 'sanity',
            products: [{ canonicalProductId: 'prod_1', name: 'Test Snack' }]
        };
        mockDb.bulkWrite.mockResolvedValue({ acknowledged: true, upsertedCount: 1 });

        const res = await request(app)
            .post('/api/v1/ingest/provider-data')
            .send(ingestionData);

        expect(res.statusCode).toEqual(201);
        expect(res.body.message).toBe('Data ingested successfully.');
        expect(mockDb.collection).toHaveBeenCalledWith('canonical_products');
        expect(mockDb.bulkWrite).toHaveBeenCalled();
    });

    it('should return a 400 error for invalid payload', async () => {
        const res = await request(app)
            .post('/api/v1/ingest/provider-data')
            .send({ provider: 'sanity' }); // Missing 'products' array

        expect(res.statusCode).toEqual(400);
        expect(res.body.error).toContain('must include a "provider" string and a "products" array');
    });

    it('should return a 500 error if the database write fails', async () => {
        const ingestionData = {
            provider: 'sanity',
            products: [{ canonicalProductId: 'prod_1', name: 'Test Snack' }]
        };
        mockDb.bulkWrite.mockRejectedValue(new Error('DB Write Error'));

        const res = await request(app)
            .post('/api/v1/ingest/provider-data')
            .send(ingestionData);

        expect(res.statusCode).toEqual(500);
        expect(res.body.error).toBe('Failed to ingest data.');
    });
  });
});
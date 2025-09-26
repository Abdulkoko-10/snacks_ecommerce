const request = require('supertest');

// Mock the MongoDB client and export the mock for use in tests
const mockDb = {
  collection: jest.fn().mockReturnThis(),
  find: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  toArray: jest.fn(),
  bulkWrite: jest.fn(),
  findOne: jest.fn(),
  deleteOne: jest.fn(),
  deleteMany: jest.fn(),
  updateOne: jest.fn(),
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

  describe('GET /api/v1/product/:slug', () => {
    it('should return a single product when found by slug', async () => {
      const mockProduct = { preview: { slug: 'found-product' }, name: 'Found Product' };
      mockDb.collection().findOne.mockResolvedValue(mockProduct);

      const res = await request(app).get('/api/v1/product/found-product');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockProduct);
      expect(mockDb.collection).toHaveBeenCalledWith('canonical_products');
      expect(mockDb.collection().findOne).toHaveBeenCalledWith({ 'preview.slug': 'found-product' });
    });

    it('should return a 404 error when a product is not found by slug', async () => {
      mockDb.collection().findOne.mockResolvedValue(null);

      const res = await request(app).get('/api/v1/product/not-found-slug');

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ error: 'Product not found.' });
    });
  });

  describe('GET /api/v1/chat/threads', () => {
    it('should return a list of chat threads', async () => {
      const mockThreads = [{ _id: 'thread_1', title: 'My First Chat' }];
      mockDb.collection().find().toArray.mockResolvedValue(mockThreads);

      const res = await request(app).get('/api/v1/chat/threads');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockThreads);
      expect(mockDb.collection).toHaveBeenCalledWith('threads');
      expect(mockDb.collection().find).toHaveBeenCalledWith({});
    });

    it('should return a 500 error if the database call fails', async () => {
      mockDb.collection().find().toArray.mockRejectedValue(new Error('DB Error'));

      const res = await request(app).get('/api/v1/chat/threads');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ error: 'Failed to fetch chat threads.' });
    });
  });

  describe('DELETE /api/v1/chat/threads/:id', () => {
    const validId = '615f7b1b3b3b3b3b3b3b3b3b';
    const notFoundId = '615f7b1b3b3b3b3b3b3b3b3c';

    it('should delete a thread and its messages successfully', async () => {
      mockDb.deleteOne.mockResolvedValue({ deletedCount: 1 });
      mockDb.deleteMany.mockResolvedValue({ deletedCount: 5 });

      const res = await request(app).delete(`/api/v1/chat/threads/${validId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toBe('Thread deleted successfully.');
      expect(mockDb.deleteMany).toHaveBeenCalledWith({ threadId: validId });
    });

    it('should return 404 if the thread to delete is not found', async () => {
      mockDb.deleteOne.mockResolvedValue({ deletedCount: 0 });

      const res = await request(app).delete(`/api/v1/chat/threads/${notFoundId}`);

      expect(res.statusCode).toEqual(404);
    });

    it('should return 400 for an invalid ID format', async () => {
        const res = await request(app).delete('/api/v1/chat/threads/invalid-id');
        expect(res.statusCode).toEqual(400);
        expect(res.body.error).toBe('Invalid thread ID format.');
    });
  });

  describe('PUT /api/v1/chat/threads/:id', () => {
    const validId = '615f7b1b3b3b3b3b3b3b3b3b';
    const notFoundId = '615f7b1b3b3b3b3b3b3b3b3c';

    it('should rename a thread successfully', async () => {
      mockDb.updateOne.mockResolvedValue({ matchedCount: 1 });

      const res = await request(app)
        .put(`/api/v1/chat/threads/${validId}`)
        .send({ title: 'New Title' });

      expect(res.statusCode).toEqual(200);
    });

    it('should return 400 if title is missing', async () => {
      const res = await request(app)
        .put(`/api/v1/chat/threads/${validId}`)
        .send({});

      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toBe('Title is required.');
    });

    it('should return 404 if the thread to rename is not found', async () => {
      mockDb.updateOne.mockResolvedValue({ matchedCount: 0 });

      const res = await request(app)
        .put(`/api/v1/chat/threads/${notFoundId}`)
        .send({ title: 'New Title' });

      expect(res.statusCode).toEqual(404);
    });

    it('should return 400 for an invalid ID format', async () => {
        const res = await request(app)
          .put('/api/v1/chat/threads/invalid-id')
          .send({ title: 'New Title' });
        expect(res.statusCode).toEqual(400);
        expect(res.body.error).toBe('Invalid thread ID format.');
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
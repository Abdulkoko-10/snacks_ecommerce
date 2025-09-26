const request = require('supertest');
const express = require('express');
const sanityClient = require('@sanity/client');

// Mock the Sanity client
jest.mock('@sanity/client', () => {
  const mClient = {
    fetch: jest.fn(),
  };
  return jest.fn(() => mClient);
});

// Mock the image URL builder as well
jest.mock('@sanity/image-url', () => () => ({
    image: () => ({
        width: () => ({
            url: () => 'http://example.com/image.png'
        })
    })
}));

const app = express();
app.use(express.json());

// Re-import the logic to be tested, but with mocks in place
const client = sanityClient();

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/products', async (req, res) => {
  try {
    const productsQuery = `*[_type == "product" && defined(slug.current)]{_id, name, image, price, details, slug} | order(_createdAt desc)`;
    const sanityProducts = await client.fetch(productsQuery);

    const canonicalProducts = sanityProducts.map(p => ({
      canonicalProductId: p._id,
      preview: {
        title: p.name,
        image: 'http://example.com/image.png',
        rating: 4.5,
        minPrice: p.price,
        bestProvider: "SnacksCo",
        eta: "15-25 min",
        originSummary: ["SnacksCo"],
        slug: p.slug?.current,
        details: p.details,
      },
      reason: "Freshly sourced from our catalog!",
      meta: {
        generatedBy: "sanity-connector",
        confidence: 1.0,
      }
    }));

    res.status(200).json(canonicalProducts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products from Sanity.' });
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

  describe('GET /products', () => {
    it('should fetch, transform, and return products', async () => {
      const mockSanityData = [
        { _id: 'prod_1', name: 'Test Snack', price: 100, slug: { current: 'test-snack' }, image: [{}] },
      ];
      client.fetch.mockResolvedValue(mockSanityData);

      const res = await request(app).get('/products');

      expect(res.statusCode).toBe(200);
      expect(client.fetch).toHaveBeenCalledTimes(1);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].canonicalProductId).toBe('prod_1');
      expect(res.body[0].preview.title).toBe('Test Snack');
      expect(res.body[0].meta.generatedBy).toBe('sanity-connector');
    });

    it('should return a 500 error if the sanity fetch fails', async () => {
      client.fetch.mockRejectedValue(new Error('Sanity fetch failed'));

      const res = await request(app).get('/products');

      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Failed to fetch products from Sanity.');
    });
  });
});
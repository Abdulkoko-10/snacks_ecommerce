import express, { Request, Response } from 'express';
import { getJson } from 'serpapi';
import Redis from 'ioredis';

const app = express();
const port = process.env.CONNECTOR_PORT || 3002; // Default to 3002 for this connector
const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

app.use(express.json());

// Check for the API key at startup
if (!process.env.SERPAPI_API_KEY) {
  throw new Error('Missing environment variable: "SERPAPI_API_KEY"');
}

// Search endpoint
app.get('/search', async (req: Request, res: Response) => {
  const { q, location } = req.query;

  if (!q || !location) {
    return res.status(400).json({ error: 'Missing required query parameters: "q" and "location"' });
  }

  const cacheKey = `serpapi:${q}:${location}`;

  try {
    // 1. Check cache first
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log('Returning cached data for key:', cacheKey);
      return res.status(200).json(JSON.parse(cachedData));
    }

    console.log('Fetching new data from SerpApi for key:', cacheKey);
    // 2. If not in cache, fetch from SerpApi
    const params = {
      engine: 'google_local',
      q: q as string,
      location: location as string,
      api_key: process.env.SERPAPI_API_KEY!, // Non-null assertion because we checked at startup
    };

    const json = await getJson(params);

    // 3. Store in cache for 1 hour
    await redisClient.set(cacheKey, JSON.stringify(json), 'EX', 3600);

    res.status(200).json(json);
  } catch (error) {
    console.error('Error fetching data from SerpApi:', error);
    res.status(500).json({ error: 'Failed to fetch data from SerpApi' });
  }
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', service: 'serpapi-connector' });
});

app.listen(port, () => {
  console.log(`SerpApi Connector service listening on port ${port}`);
});

export default app;

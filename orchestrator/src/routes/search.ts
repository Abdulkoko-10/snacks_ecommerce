import { Router } from 'express';
import { search as searchWithGeoapify } from '@fd/geoapify-connector';

const router = Router();

router.get('/', async (req, res) => {
  const { q, lat, lon } = req.query;

  if (!q || !lat || !lon) {
    return res.status(400).json({ error: 'Query parameters "q", "lat", and "lon" are required.' });
  }

  try {
    const query = q as string;
    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lon as string);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ error: 'Invalid "lat" or "lon" parameters.' });
    }

    const results = await searchWithGeoapify(query, latitude, longitude);
    res.status(200).json(results);
  } catch (error) {
    console.error("Error in /api/v1/search handler:", error);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
});

export default router;
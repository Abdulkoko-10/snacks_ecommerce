import type { NextApiRequest, NextApiResponse } from 'next';
import { CanonicalRestaurant } from "@fd/schemas";
const { extractSearchIntent } = require("../../../lib/gemini");
const { searchRestaurants } = require("../../../lib/serpapi");
const { geocodeLocation } = require("../../../lib/location");

interface SearchIntent {
  query: string;
  region: string;
  filters: Record<string, string>;
}

// The handler is now the "orchestrator"
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CanonicalRestaurant[] | { error: string }>
) {
  const { q, region, limit = '20', offset = '0' } = req.query;

  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Query parameter "q" is required and must be a string.' });
  }

  const parsedLimit = parseInt(limit as string, 10);
  const parsedOffset = parseInt(offset as string, 10);

  try {
    // 1. Get structured intent from the user's query
    const intent: SearchIntent = await extractSearchIntent(q);

    // If a region is specified in the query params, it overrides the one from intent extraction.
    if (region && typeof region === 'string') {
      intent.region = region;
    }

    // 2. Geocode the location to get coordinates
    let geocode = null;
    try {
      geocode = await geocodeLocation(intent.region);
    } catch (geoError) {
      console.warn(`Geocoding failed for region "${intent.region}", proceeding without ll parameter.`);
      // Continue without geocode, SerpApi will use region string
    }

    // 3. Call the connector with the structured intent and geocode
    const results = await searchRestaurants(intent, parsedLimit, parsedOffset, geocode);

    // 4. Respond with the results
    res.status(200).json(results);
  } catch (error) {
    console.error("Error in /api/v1/search orchestrator:", error);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
}

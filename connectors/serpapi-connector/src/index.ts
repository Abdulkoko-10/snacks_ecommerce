import { getJson } from "serpapi";
import { CanonicalProduct } from '@fd/schemas';

const SERPAPI_API_KEY = process.env.SERPAPI_API_KEY;

export interface EnrichmentData {
  photos?: string[];
  reviews?: { author_name: string; rating: number; text: string }[];
  website?: string;
  rating?: number;
  user_ratings_total?: number;
  serpapiPlaceId?: string;
}

export async function getEnrichmentData(product: Partial<CanonicalProduct>): Promise<EnrichmentData | null> {
  if (!SERPAPI_API_KEY || !product.title) {
    console.warn("SERPAPI_API_KEY is not defined or product title is missing. Skipping enrichment.");
    return null;
  }

  const params = {
    engine: "google",
    q: `${product.title} ${product.description}`, // Use title and address for a more specific search
    api_key: SERPAPI_API_KEY
  };

  try {
    const response = await getJson(params);
    const placeInfo = response.knowledge_graph;

    if (!placeInfo) return null;

    const enrichmentData: EnrichmentData = {
      website: placeInfo.website,
      rating: placeInfo.rating,
      user_ratings_total: placeInfo.reviews,
      photos: placeInfo.photos_results?.map((p: any) => p.image),
      reviews: response.reviews, // Top-level reviews if available
      serpapiPlaceId: placeInfo.place_id
    };

    return enrichmentData;
  } catch (error) {
    console.error(`Error enriching ${product.title} with SerpApi:`, error);
    return null;
  }
}
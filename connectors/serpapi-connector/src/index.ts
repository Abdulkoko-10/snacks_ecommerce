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

    // Safely access the knowledge graph and its properties
    const placeInfo = response?.knowledge_graph;
    const reviews = response?.reviews;
    const photos = response?.photos_results;

    if (!placeInfo) {
      console.warn(`No knowledge graph found for "${product.title}" in SerpApi response.`);
      return null;
    }

    const enrichmentData: EnrichmentData = {
      website: placeInfo.website,
      rating: placeInfo.rating,
      user_ratings_total: placeInfo.reviews, // This is often a count
      photos: photos?.map((p: any) => p.image_url || p.image).filter(Boolean),
      reviews: reviews,
      serpapiPlaceId: placeInfo.place_id
    };

    // Clean up any keys that have undefined values
    Object.keys(enrichmentData).forEach(key => (enrichmentData as any)[key] === undefined && delete (enrichmentData as any)[key]);

    return enrichmentData;
  } catch (error) {
    console.error(`Error enriching ${product.title} with SerpApi:`, error);
    return null;
  }
}
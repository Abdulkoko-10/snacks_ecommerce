import axios from 'axios';
import { CanonicalProduct } from '@fd/schemas';

const GOOGLE_API_KEY = process.env.GEMINI_API_KEY;

export interface EnrichmentData {
  photos?: string[];
  reviews?: { author_name: string; rating: number; text: string }[];
  website?: string;
  international_phone_number?: string;
  rating?: number;
  user_ratings_total?: number;
  googlePlaceId?: string;
}

async function findPlaceId(product: Partial<CanonicalProduct>): Promise<string | null> {
  if (!GOOGLE_API_KEY || !product.title || !product.location) return null;
  const { title, location } = product;
  const params = {
    input: title,
    inputtype: 'textquery',
    fields: 'place_id',
    locationbias: `circle:2000@${location.coordinates[1]},${location.coordinates[0]}`,
    key: GOOGLE_API_KEY
  };
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/findplacefromtext/json', { params });
    return response.data.candidates?.[0]?.place_id || null;
  } catch (error) {
    console.error(`Error finding place ID for "${title}" from Google:`, error);
    return null;
  }
}

export async function getEnrichmentData(product: Partial<CanonicalProduct>): Promise<EnrichmentData | null> {
  if (!GOOGLE_API_KEY) {
    console.warn("GOOGLE_PLACES_API_KEY is not defined. Skipping enrichment.");
    return null;
  }

  const placeId = await findPlaceId(product);
  if (!placeId) return null;

  const params = {
    place_id: placeId,
    fields: 'photos,reviews,website,international_phone_number,rating,user_ratings_total',
    key: GOOGLE_API_KEY
  };
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', { params });
    const result = response.data.result;
    if (!result) return null;

    return {
      googlePlaceId: placeId,
      website: result.website,
      international_phone_number: result.international_phone_number,
      rating: result.rating,
      user_ratings_total: result.user_ratings_total,
      photos: result.photos?.map((p: any) => `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${p.photo_reference}&key=${GOOGLE_API_KEY}`),
      reviews: result.reviews
    };
  } catch (error) {
    console.error(`Error fetching place details for placeId "${placeId}" from Google:`, error);
    return null;
  }
}
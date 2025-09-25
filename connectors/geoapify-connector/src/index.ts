import axios from 'axios';
import { CanonicalProduct, CanonicalProductSchema } from '@fd/schemas';

const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY;

export async function search(query: string, lat: number, lon: number): Promise<Partial<CanonicalProduct>[]> {
  if (!GEOAPIFY_API_KEY) {
    console.warn("GEOAPIFY_API_KEY is not defined. Returning empty array.");
    return [];
  }

  const params = {
    text: query,
    filter: `circle:${lon},${lat},5000`, // 5km radius
    bias: `proximity:${lon},${lat}`,
    limit: 20,
    apiKey: GEOAPIFY_API_KEY
  };

  try {
    const response = await axios.get('https://api.geoapify.com/v2/places', { params });

    return response.data.features.map((feature: any) => {
      const props = feature.properties;
      const geometry = feature.geometry;
      const product: Partial<CanonicalProduct> = {
        canonicalProductId: `geoapify::${props.place_id}`,
        title: props.name || 'N/A',
        description: props.address_line2 || 'No description available.',
        location: geometry,
        tags: props.categories,
        lastFetchedAt: new Date().toISOString(),
        sources: [{
          provider: 'Geoapify',
          providerProductId: props.place_id,
          price: { amount: 0, currency: 'USD' }, // Default price
          lastFetchedAt: new Date().toISOString(),
        }],
        images: [],
        comments: []
      };
      return product;
    });
  } catch (error) {
    console.error("Error fetching data from Geoapify:", error);
    return [];
  }
}
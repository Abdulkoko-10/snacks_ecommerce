import axios from 'axios';
import { CanonicalProduct, CanonicalProductSchema } from '@fd/schemas';

const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY;

// This function calls the Geoapify Places API and transforms the results
export async function search(query: string, lat: number, lon: number): Promise<CanonicalProduct[]> {
  if (!GEOAPIFY_API_KEY) {
    console.warn("GEOAPIFY_API_KEY is not defined. Returning mock data from connector.");
    // Return mock data that conforms to CanonicalProductSchema
    return [{
      canonicalProductId: "mock-geoapify-id-1",
      title: "Mock Restaurant from Geoapify Connector",
      images: ["https://via.placeholder.com/150"],
      description: "A delicious mock restaurant from the Geoapify connector.",
      price: { amount: 15.99, currency: "USD" },
      rating: 4.2,
      numRatings: 50,
      tags: ["restaurant", "mock"],
      sources: [{
        provider: "Geoapify",
        providerProductId: "mock-geo-id-1",
        price: 15.99,
        lastFetchedAt: new Date().toISOString(),
      }],
      comments: [],
      popularityScore: 0.7,
      lastFetchedAt: new Date().toISOString(),
    }];
  }

  const params = {
    categories: 'catering.restaurant',
    filter: `circle:${lon},${lat},5000`, // 5km radius
    bias: `proximity:${lon},${lat}`,
    limit: 20,
    apiKey: GEOAPIFY_API_KEY
  };

  try {
    const response = await axios.get('https://api.geoapify.com/v2/places', { params });

    const transformedResults: CanonicalProduct[] = response.data.features.map((feature: any) => {
      const props = feature.properties;
      const product: CanonicalProduct = {
        canonicalProductId: `geoapify::${props.place_id}`,
        title: props.name || 'N/A',
        images: [], // Geoapify does not provide images directly
        description: props.address_line2 || 'No description available.',
        price: { amount: 0, currency: 'USD' }, // Price info not available
        rating: props.rating, // Rating may not always be available
        numRatings: 0,
        tags: props.categories,
        sources: [{
          provider: 'Geoapify',
          providerProductId: props.place_id,
          price: 0,
          lastFetchedAt: new Date().toISOString(),
        }],
        comments: [],
        popularityScore: 0,
        lastFetchedAt: new Date().toISOString(),
      };
      // We use .partial().safeParse to handle cases where the API response is missing fields
      const parsed = CanonicalProductSchema.partial().safeParse(product);
      if (parsed.success) {
        return parsed.data as CanonicalProduct;
      }
      return null;
    }).filter((p): p is CanonicalProduct => p !== null);

    return transformedResults;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error fetching data from Geoapify:", error.response?.data);
    } else {
      console.error("An unknown error occurred while fetching from Geoapify.");
    }
    return [];
  }
}
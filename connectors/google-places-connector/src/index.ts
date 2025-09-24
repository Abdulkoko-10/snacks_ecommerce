import { CanonicalProduct } from '@fd/schemas';
import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const ORCHESTRATOR_URL = process.env.ORCHESTRATOR_URL || 'http://localhost:3001';

// TODO: Replace this with a real call to the Google Places API.
// This will require an API key, which should be stored securely and loaded from environment variables.
async function fetchMockGooglePlacesData(): Promise<any[]> {
  console.log('Fetching MOCK data (simulating Google Places)...');
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([
        {
          place_id: 'gm-place-1',
          name: 'The Pizza Palace',
          rating: 4.5,
          user_ratings_total: 150,
          price_level: 2,
          photos: [{ photo_reference: 'photo-ref-1' }],
          vicinity: '123 Pizza Lane, Foodville',
          types: ['pizza', 'italian', 'restaurant']
        },
        {
          place_id: 'gm-place-2',
          name: 'Burger Bonanza',
          rating: 4.2,
          user_ratings_total: 200,
          price_level: 1,
          photos: [{ photo_reference: 'photo-ref-2' }],
          vicinity: '456 Burger Blvd, Foodville',
          types: ['burger', 'fast_food', 'restaurant']
        }
      ]);
    }, 500);
  });
}

// Function to transform Google Places data into CanonicalProduct format
function transformToCanonicalProduct(place: any): CanonicalProduct {
  const canonical: CanonicalProduct = {
    canonicalProductId: `google-places::${place.place_id}`,
    title: place.name,
    images: place.photos.map((p: any) => `https://maps.googleapis.com/maps/api/place/photo?photoreference=${p.photo_reference}`),
    description: place.vicinity,
    price: {
      amount: place.price_level * 10, // Arbitrary transformation
      currency: 'USD'
    },
    rating: place.rating,
    numRatings: place.user_ratings_total,
    tags: place.types,
    sources: [
      {
        provider: 'GooglePlaces',
        providerProductId: place.place_id,
        price: place.price_level * 10,
        lastFetchedAt: new Date().toISOString()
      }
    ],
    comments: [],
    popularityScore: place.user_ratings_total,
    lastFetchedAt: new Date().toISOString()
  };
  return canonical;
}

// Function to send data to the orchestrator
async function sendDataToOrchestrator(products: CanonicalProduct[]) {
  try {
    console.log(`Sending ${products.length} products to orchestrator at ${ORCHESTRATOR_URL}...`);
    await axios.post(`${ORCHESTRATOR_URL}/api/v1/ingest`, {
      provider: 'GooglePlaces',
      products: products
    });
    console.log('Data sent successfully.');
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error sending data to orchestrator:', error.message);
    } else {
      console.error('An unknown error occurred:', error);
    }
  }
}

// Main function to run the connector
async function main() {
  const places = await fetchMockGooglePlacesData();
  const canonicalProducts = places.map(transformToCanonicalProduct);

  await sendDataToOrchestrator(canonicalProducts);
}

main();

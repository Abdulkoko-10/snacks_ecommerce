export interface Comment {
  id: string;
  text: string;
  author: string; // "Alice", "user:clerk_user_1"
  origin: string; // "external:UberEats", "food-discovery"
  rating?: number; // Optional
  createdAt: string; // ISO 8601 date string
}

export interface CanonicalProduct {
  canonicalProductId: string; // e.g., "fd::pizza::uuid123"
  title: string;
  images: string[];
  description: string;
  price: {
    amount: number;
    currency: string;
  };
  rating: number;
  numRatings: number;
  tags: string[];
  sources: {
    provider: string; // "UberEats", "Doordash", "FoodDiscovery"
    providerProductId: string;
    price: number;
    deliveryEtaMin?: number;
    lastFetchedAt: string; // ISO 8601 date string
  }[];
  comments: Comment[];
  popularityScore: number;
  lastFetchedAt: string; // ISO 8601 date string
}

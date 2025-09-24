import { z } from 'zod';

// Schema for a single data source for a product
export const SourceSchema = z.object({
  provider: z.string(),
  providerProductId: z.string(),
  price: z.number().optional(),
  deliveryEtaMin: z.number().optional(),
  lastFetchedAt: z.string().datetime(),
});

// Zod Schema for the canonical product model
export const CanonicalProductSchema = z.object({
  canonicalProductId: z.string(),
  title: z.string(),
  images: z.array(z.string().url()),
  description: z.string().optional(),
  price: z.object({
    amount: z.number(),
    currency: z.string().length(3),
  }).optional(),
  rating: z.number().optional(),
  numRatings: z.number().optional(),
  tags: z.array(z.string()).optional(),
  sources: z.array(SourceSchema),
  // Legacy fields for compatibility, can be removed later
  placeId: z.string().optional(),
  address: z.string().optional(),
});

// TypeScript types inferred from the Zod schemas
export type Source = z.infer<typeof SourceSchema>;
export type CanonicalProduct = z.infer<typeof CanonicalProductSchema>;

// For backward compatibility, we can alias the old name for a while.
export const CanonicalRestaurantSchema = CanonicalProductSchema;
export type CanonicalRestaurant = CanonicalProduct;

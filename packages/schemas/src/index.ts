import { z } from 'zod';

// Schema for a GeoJSON Point for location data
export const PointSchema = z.object({
  type: z.literal('Point'),
  coordinates: z.tuple([z.number(), z.number()]), // [longitude, latitude]
});

// Schema for a comment, which can be nested within a product
export const CommentSchema = z.object({
  id: z.string(),
  text: z.string(),
  author: z.string(),
  origin: z.string(), // e.g., "external:UberEats", "food-discovery"
  rating: z.number().optional(),
  createdAt: z.string().datetime(),
});

// Schema for a source, detailing where the product info came from
export const SourceSchema = z.object({
  provider: z.string(), // e.g., "UberEats", "Doordash", "FoodDiscovery"
  providerProductId: z.string(),
  price: z.number(),
  deliveryEtaMin: z.number().optional(),
  lastFetchedAt: z.string().datetime(),
});

// The main CanonicalProduct schema, unifying product data from all sources
export const CanonicalProductSchema = z.object({
  canonicalProductId: z.string(), // e.g., "fd::pizza::uuid123"
  title: z.string(),
  images: z.array(z.string().url()),
  description: z.string(),
  location: PointSchema,
  price: z.object({
    amount: z.number(),
    currency: z.string(),
  }),
  rating: z.number().optional(),
  numRatings: z.number().optional(),
  tags: z.array(z.string()),
  sources: z.array(SourceSchema),
  comments: z.array(CommentSchema),
  popularityScore: z.number().optional(),
  lastFetchedAt: z.string().datetime(),
});

// TypeScript types inferred from the Zod schemas
export type Point = z.infer<typeof PointSchema>;
export type CanonicalProduct = z.infer<typeof CanonicalProductSchema>;
export type Comment = z.infer<typeof CommentSchema>;
export type Source = z.infer<typeof SourceSchema>;
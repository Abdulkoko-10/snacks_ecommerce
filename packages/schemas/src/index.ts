import { z } from 'zod';

// Nested Comment Schema
export const CommentSchema = z.object({
  id: z.string(),
  text: z.string(),
  author: z.string(),
  origin: z.string(), // e.g., "external:UberEats", "food-discovery"
  rating: z.number().optional(),
  createdAt: z.string().datetime(),
});

// Nested Source Schema
export const SourceSchema = z.object({
  provider: z.string(), // e.g., "UberEats", "Doordash", "FoodDiscovery"
  providerProductId: z.string(),
  price: z.number(),
  deliveryEtaMin: z.number().nullable(),
  lastFetchedAt: z.string().datetime(),
});

// Main CanonicalProduct Schema
export const CanonicalProductSchema = z.object({
  canonicalProductId: z.string().describe("The unique identifier for the product across all sources, e.g., fd::pizza::uuid123"),
  title: z.string(),
  address: z.string(),
  images: z.array(z.string().url()),
  description: z.string(),
  price: z.object({
    amount: z.number(),
    currency: z.string().length(3),
  }),
  rating: z.number(),
  numRatings: z.number(),
  tags: z.array(z.string()),
  sources: z.array(SourceSchema),
  comments: z.array(CommentSchema),
  popularityScore: z.number(),
  lastFetchedAt: z.string().datetime(),
});

// TypeScript types inferred from schemas
export type Comment = z.infer<typeof CommentSchema>;
export type Source = z.infer<typeof SourceSchema>;
export type CanonicalProduct = z.infer<typeof CanonicalProductSchema>;
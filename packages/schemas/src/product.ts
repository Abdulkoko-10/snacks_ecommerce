import { z } from 'zod';

export const ProductSchema = z.object({
  _id: z.string(),
  name: z.string(),
  image: z.array(z.any()).optional(), // Keeping flexible for now
  price: z.number(),
  details: z.string().optional(),
  slug: z.object({ current: z.string() }).optional(),
});

export const CanonicalProductSchema = z.object({
  canonicalProductId: z.string(),
  preview: z.object({
    title: z.string(),
    image: z.string().url(),
    rating: z.number().optional(),
    minPrice: z.number(),
    bestProvider: z.string(),
    eta: z.string(),
    originSummary: z.array(z.string()),
    slug: z.string().optional(),
    details: z.string().optional(),
  }),
  reason: z.string(),
  meta: z.object({
    generatedBy: z.string(),
    confidence: z.number(),
  }),
});

export type Product = z.infer<typeof ProductSchema>;
export type CanonicalProduct = z.infer<typeof CanonicalProductSchema>;
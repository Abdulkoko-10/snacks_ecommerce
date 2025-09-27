export * from './product';
export * from './comment';
export * from './chatMessage';
export * from './recommendationPayload';

import { z } from 'zod';

// Zod Schema for validation
export const CanonicalRestaurantSchema = z.object({
  placeId: z.string(),
  name: z.string(),
  address: z.string().optional(),
  rating: z.number().optional(),
  website: z.string().url().optional(),
  phone_number: z.string().optional(),
  photos: z.array(z.string().url()).optional(),
  deliveryProviders: z.array(z.string()).optional(),
});

// TypeScript type inferred from the Zod schema
export type CanonicalRestaurant = z.infer<typeof CanonicalRestaurantSchema>;
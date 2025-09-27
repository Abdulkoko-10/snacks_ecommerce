import { z } from 'zod';
import { CanonicalProductSchema } from './product';

export const RecommendationPayloadSchema = z.object({
  fullText: z.string(),
  recommendations: z.array(CanonicalProductSchema),
});

export type RecommendationPayload = z.infer<typeof RecommendationPayloadSchema>;
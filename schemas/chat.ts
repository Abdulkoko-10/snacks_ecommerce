import { z } from 'zod';

// From the prompt
export const ChatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant']),
  text: z.string(),
  createdAt: z.string(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

// From the prompt and docs/04_API_CONTRACTS.md
export const ChatRecommendationCardSchema = z.object({
  canonicalProductId: z.string(),
  preview: z.object({
    title: z.string(),
    image: z.string().url(),
    rating: z.number(),
    minPrice: z.number(),
    bestProvider: z.string(),
    eta: z.string(),
    originSummary: z.array(z.string()),
  }),
  reason: z.string(),
});

export type ChatRecommendationCard = z.infer<typeof ChatRecommendationCardSchema>;

// From the prompt and docs/04_API_CONTRACTS.md
export const ChatRecommendationPayloadSchema = z.object({
  messageId: z.string(),
  recommendations: z.array(ChatRecommendationCardSchema),
});

export type ChatRecommendationPayload = z.infer<typeof ChatRecommendationPayloadSchema>;

// From docs/03_DATA_MODELS.md
export const CanonicalProductSchema = z.object({
    canonicalProductId: z.string(),
    title: z.string(),
    images: z.array(z.string().url()),
    description: z.string(),
    price: z.object({
        amount: z.number(),
        currency: z.string(),
    }),
    rating: z.number(),
    numRatings: z.number(),
    tags: z.array(z.string()),
    sources: z.array(z.object({
        provider: z.string(),
        providerProductId: z.string(),
        price: z.number(),
        deliveryEtaMin: z.number(),
        lastFetchedAt: z.string().datetime(),
    })),
    comments: z.array(z.object({
        id: z.string(),
        text: z.string(),
        author: z.string(),
        origin: z.string(),
        rating: z.number().optional(),
        createdAt: z.string().datetime(),
    })),
    popularityScore: z.number(),
    lastFetchedAt: z.string().datetime(),
});

export type CanonicalProduct = z.infer<typeof CanonicalProductSchema>;

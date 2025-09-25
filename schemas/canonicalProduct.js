const { z } = require('zod');

/**
 * The single source of truth for a product's data structure across all services.
 * This schema is used to validate data from provider connectors and ensure consistency.
 */
const CanonicalProductSchema = z.object({
  provider: z.string().describe("The origin of the data (e.g., 'serpapi', 'doordash')."),
  providerProductId: z.string().describe("The unique ID of the product from the provider's system."),

  title: z.string(),
  imageUrl: z.string().url().optional().describe("A valid URL for the product's primary image."),

  rating: z.number().optional().describe("The average rating, typically out of 5."),
  reviewCount: z.number().optional().describe("The total number of reviews or ratings."),

  price: z.number().optional().describe("The price of the item. To be unified later."),

  // Location and provider-specific details
  address: z.string().optional(),
  providerDetails: z.record(z.any()).optional().describe("An object to hold any other provider-specific data that doesn't fit the canonical model."),
});

/**
 * A wrapper for a list of canonical products, often used in search results.
 */
const CanonicalProductListSchema = z.array(CanonicalProductSchema);

// Using module.exports for compatibility between Node.js services (CommonJS)
// and potential future use in the Next.js app (ESM).
module.exports = {
  CanonicalProductSchema,
  CanonicalProductListSchema,
};
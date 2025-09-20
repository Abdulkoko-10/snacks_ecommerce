/**
 * @typedef {'user' | 'assistant'} ChatRole
 */

/**
 * Represents a single message in a chat thread.
 * @typedef {object} ChatMessage
 * @property {string} id - The unique identifier for the message.
 * @property {ChatRole} role - The role of the entity that created the message.
 * @property {string} text - The text content of the message.
 * @property {string} createdAt - An ISO 8601 formatted date string.
 */

/**
 * Represents the preview data for a recommended product.
 * @typedef {object} ChatRecommendationPreview
 * @property {string} title - The title of the product.
 * @property {string} image - The URL for the product image.
 * @property {number} rating - The product's rating, e.g., 4.5.
 * @property {number} minPrice - The minimum price for the product.
 * @property {string} bestProvider - The name of the best provider for this option.
 * @property {string} eta - The estimated time of arrival, e.g., "18-25 min".
 * @property {string[]} originSummary - A list of providers where this item is available.
 */

/**
 * Represents a single recommendation card shown to the user.
 * @typedef {object} ChatRecommendationCard
 * @property {string} canonicalProductId - The unique identifier for the canonical product.
 * @property {ChatRecommendationPreview} preview - The preview data for the card.
 * @property {string} reason - The AI-generated reason for this recommendation.
 */

/**
 * Represents the full payload of recommendations associated with a message.
 * @typedef {object} ChatRecommendationPayload
 * @property {string} messageId - The ID of the assistant's message these recommendations are for.
 * @property {ChatRecommendationCard[]} recommendations - A list of recommendation cards.
 */

// This empty export is here to ensure this file is treated as a module.
export const schemas = {};

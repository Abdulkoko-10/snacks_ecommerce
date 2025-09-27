"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanonicalProductSchema = exports.SourceSchema = exports.CommentSchema = void 0;
const zod_1 = require("zod");
// Nested Comment Schema
exports.CommentSchema = zod_1.z.object({
    id: zod_1.z.string(),
    text: zod_1.z.string(),
    author: zod_1.z.string(),
    origin: zod_1.z.string(), // e.g., "external:UberEats", "food-discovery"
    rating: zod_1.z.number().optional(),
    createdAt: zod_1.z.string().datetime(),
});
// Nested Source Schema
exports.SourceSchema = zod_1.z.object({
    provider: zod_1.z.string(), // e.g., "UberEats", "Doordash", "FoodDiscovery"
    providerProductId: zod_1.z.string(),
    price: zod_1.z.number(),
    deliveryEtaMin: zod_1.z.number().nullable(),
    lastFetchedAt: zod_1.z.string().datetime(),
});
// Main CanonicalProduct Schema
exports.CanonicalProductSchema = zod_1.z.object({
    canonicalProductId: zod_1.z.string().describe("The unique identifier for the product across all sources, e.g., fd::pizza::uuid123"),
    title: zod_1.z.string(),
    address: zod_1.z.string(),
    images: zod_1.z.array(zod_1.z.string().url()),
    description: zod_1.z.string(),
    price: zod_1.z.object({
        amount: zod_1.z.number(),
        currency: zod_1.z.string().length(3),
    }),
    rating: zod_1.z.number(),
    numRatings: zod_1.z.number(),
    tags: zod_1.z.array(zod_1.z.string()),
    sources: zod_1.z.array(exports.SourceSchema),
    comments: zod_1.z.array(exports.CommentSchema),
    popularityScore: zod_1.z.number(),
    lastFetchedAt: zod_1.z.string().datetime(),
});

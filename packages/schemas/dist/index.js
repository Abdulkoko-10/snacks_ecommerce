"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanonicalProductSchema = exports.SourceSchema = exports.CommentSchema = exports.PointSchema = void 0;
const zod_1 = require("zod");
// Schema for a GeoJSON Point for location data
exports.PointSchema = zod_1.z.object({
    type: zod_1.z.literal('Point'),
    coordinates: zod_1.z.tuple([zod_1.z.number(), zod_1.z.number()]), // [longitude, latitude]
});
// Schema for a comment, which can be nested within a product
exports.CommentSchema = zod_1.z.object({
    id: zod_1.z.string(),
    text: zod_1.z.string(),
    author: zod_1.z.string(),
    origin: zod_1.z.string(), // e.g., "external:UberEats", "food-discovery"
    rating: zod_1.z.number().optional(),
    createdAt: zod_1.z.string().datetime(),
});
// Schema for a source, detailing where the product info came from
exports.SourceSchema = zod_1.z.object({
    provider: zod_1.z.string(), // e.g., "UberEats", "Doordash", "FoodDiscovery"
    providerProductId: zod_1.z.string(),
    price: zod_1.z.number(),
    deliveryEtaMin: zod_1.z.number().optional(),
    lastFetchedAt: zod_1.z.string().datetime(),
});
// The main CanonicalProduct schema, unifying product data from all sources
exports.CanonicalProductSchema = zod_1.z.object({
    canonicalProductId: zod_1.z.string(), // e.g., "fd::pizza::uuid123"
    title: zod_1.z.string(),
    images: zod_1.z.array(zod_1.z.string().url()),
    description: zod_1.z.string(),
    location: exports.PointSchema,
    price: zod_1.z.object({
        amount: zod_1.z.number(),
        currency: zod_1.z.string(),
    }),
    rating: zod_1.z.number().optional(),
    numRatings: zod_1.z.number().optional(),
    tags: zod_1.z.array(zod_1.z.string()),
    sources: zod_1.z.array(exports.SourceSchema),
    comments: zod_1.z.array(exports.CommentSchema),
    popularityScore: zod_1.z.number().optional(),
    lastFetchedAt: zod_1.z.string().datetime(),
});

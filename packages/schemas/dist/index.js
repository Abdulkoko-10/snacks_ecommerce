"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanonicalRestaurantSchema = void 0;
const zod_1 = require("zod");
// Zod Schema for validation
exports.CanonicalRestaurantSchema = zod_1.z.object({
    placeId: zod_1.z.string(),
    name: zod_1.z.string(),
    address: zod_1.z.string().optional(),
    rating: zod_1.z.number().optional(),
    website: zod_1.z.string().url().optional(),
    phone_number: zod_1.z.string().optional(),
    photos: zod_1.z.array(zod_1.z.string().url()).optional(),
    deliveryProviders: zod_1.z.array(zod_1.z.string()).optional(),
});

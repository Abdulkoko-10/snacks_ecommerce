"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnrichmentData = void 0;
const serpapi_1 = require("serpapi");
const SERPAPI_API_KEY = process.env.SERPAPI_API_KEY;
function getEnrichmentData(product) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!SERPAPI_API_KEY || !product.title) {
            console.warn("SERPAPI_API_KEY is not defined or product title is missing. Skipping enrichment.");
            return null;
        }
        const params = {
            engine: "google",
            q: `${product.title} ${product.description}`,
            api_key: SERPAPI_API_KEY
        };
        try {
            const response = yield (0, serpapi_1.getJson)(params);
            // Safely access the knowledge graph and its properties
            const placeInfo = response === null || response === void 0 ? void 0 : response.knowledge_graph;
            const reviews = response === null || response === void 0 ? void 0 : response.reviews;
            const photos = response === null || response === void 0 ? void 0 : response.photos_results;
            if (!placeInfo) {
                console.warn(`No knowledge graph found for "${product.title}" in SerpApi response.`);
                return null;
            }
            const enrichmentData = {
                website: placeInfo.website,
                rating: placeInfo.rating,
                user_ratings_total: placeInfo.reviews,
                photos: photos === null || photos === void 0 ? void 0 : photos.map((p) => p.image_url || p.image).filter(Boolean),
                reviews: reviews,
                serpapiPlaceId: placeInfo.place_id
            };
            // Clean up any keys that have undefined values
            Object.keys(enrichmentData).forEach(key => enrichmentData[key] === undefined && delete enrichmentData[key]);
            return enrichmentData;
        }
        catch (error) {
            console.error(`Error enriching ${product.title} with SerpApi:`, error);
            return null;
        }
    });
}
exports.getEnrichmentData = getEnrichmentData;

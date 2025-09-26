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
const express_1 = require("express");
const geoapify_connector_1 = require("@fd/geoapify-connector");
const serpapi_connector_1 = require("@fd/serpapi-connector");
const mongodb_1 = require("../lib/mongodb");
const schemas_1 = require("@fd/schemas");
const router = (0, express_1.Router)();
const CACHE_RADIUS_METERS = 5000; // 5km
function enrichProduct(product) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const enrichmentData = yield (0, serpapi_connector_1.getEnrichmentData)(product);
            if (enrichmentData) {
                const { db } = yield (0, mongodb_1.connectToDatabase)();
                const productsCollection = db.collection('products');
                const updateData = {
                    images: [...(product.images || []), ...(enrichmentData.photos || [])],
                    comments: [...(product.comments || []), ...(((_a = enrichmentData.reviews) === null || _a === void 0 ? void 0 : _a.map(r => ({
                            id: new Date().toISOString(),
                            text: r.text,
                            author: r.author_name,
                            origin: 'serpapi',
                            rating: r.rating,
                            createdAt: new Date().toISOString(),
                        }))) || [])],
                    rating: enrichmentData.rating || product.rating,
                    numRatings: enrichmentData.user_ratings_total || product.numRatings,
                };
                if (enrichmentData.serpapiPlaceId) {
                    updateData.sources = [...(product.sources || []), { provider: 'SerpApi', providerProductId: enrichmentData.serpapiPlaceId, price: 0, lastFetchedAt: new Date().toISOString() }];
                }
                yield productsCollection.updateOne({ canonicalProductId: product.canonicalProductId }, { $set: updateData });
                console.log(`Enriched product: ${product.canonicalProductId} with SerpApi`);
            }
        }
        catch (error) {
            console.error(`Failed to enrich product ${product.canonicalProductId}:`, error);
        }
    });
}
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { q, lat, lon } = req.query;
    if (!q || !lat || !lon) {
        return res.status(400).json({ error: 'Query parameters "q", "lat", and "lon" are required.' });
    }
    try {
        const query = q;
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);
        if (isNaN(latitude) || isNaN(longitude)) {
            return res.status(400).json({ error: 'Invalid "lat" or "lon" parameters.' });
        }
        const { db } = yield (0, mongodb_1.connectToDatabase)();
        const productsCollection = db.collection('products');
        yield productsCollection.createIndex({ location: "2dsphere" });
        yield productsCollection.createIndex({ title: "text", description: "text" });
        const pipeline = [
            {
                $geoNear: {
                    near: {
                        type: 'Point',
                        coordinates: [longitude, latitude],
                    },
                    distanceField: 'distance',
                    maxDistance: CACHE_RADIUS_METERS,
                    spherical: true,
                },
            },
            {
                $match: {
                    $text: { $search: query },
                },
            },
            {
                $limit: 20,
            },
        ];
        const cachedProducts = yield productsCollection.aggregate(pipeline).toArray();
        if (cachedProducts.length > 0) {
            console.log(`Cache hit: Found ${cachedProducts.length} products for query "${query}" in the database.`);
            return res.status(200).json(cachedProducts);
        }
        console.log(`Cache miss for query "${query}". Fetching from Geoapify.`);
        const geoapifyResults = yield (0, geoapify_connector_1.search)(query, latitude, longitude);
        const validProducts = geoapifyResults
            .map(p => schemas_1.CanonicalProductSchema.partial().safeParse(p))
            .filter(p => p.success)
            .map(p => p.data);
        if (validProducts.length > 0) {
            const operations = validProducts.map(product => ({
                updateOne: {
                    filter: { canonicalProductId: product.canonicalProductId },
                    update: { $set: product },
                    upsert: true,
                },
            }));
            yield productsCollection.bulkWrite(operations);
            console.log(`Persisted ${validProducts.length} products.`);
        }
        const productIds = validProducts.map(p => p.canonicalProductId).filter((id) => !!id);
        const newProducts = yield productsCollection.find({
            canonicalProductId: { $in: productIds }
        }).toArray();
        res.status(200).json(newProducts);
        newProducts.forEach(product => enrichProduct(product));
    }
    catch (error) {
        console.error("Error in /api/v1/search handler:", error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'An internal server error occurred.' });
        }
    }
}));
exports.default = router;

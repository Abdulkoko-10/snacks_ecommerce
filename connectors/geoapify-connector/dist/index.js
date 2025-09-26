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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.search = void 0;
const axios_1 = __importDefault(require("axios"));
const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY;
function search(query, lat, lon) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!GEOAPIFY_API_KEY) {
            console.warn("GEOAPIFY_API_KEY is not defined. Returning empty array.");
            return [];
        }
        const params = {
            text: query,
            filter: `circle:${lon},${lat},5000`,
            bias: `proximity:${lon},${lat}`,
            limit: 20,
            apiKey: GEOAPIFY_API_KEY
        };
        try {
            const response = yield axios_1.default.get('https://api.geoapify.com/v2/places', { params });
            return response.data.features.map((feature) => {
                const props = feature.properties;
                const geometry = feature.geometry;
                const product = {
                    canonicalProductId: `geoapify::${props.place_id}`,
                    title: props.name || 'N/A',
                    description: props.address_line2 || 'No description available.',
                    location: geometry,
                    price: { amount: 0, currency: 'USD' },
                    tags: props.categories,
                    lastFetchedAt: new Date().toISOString(),
                    sources: [{
                            provider: 'Geoapify',
                            providerProductId: props.place_id,
                            price: 0,
                            lastFetchedAt: new Date().toISOString(),
                        }],
                    images: [],
                    comments: []
                };
                return product;
            });
        }
        catch (error) {
            console.error("Error fetching data from Geoapify:", error);
            return [];
        }
    });
}
exports.search = search;

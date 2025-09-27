declare const getJson: any;
declare const CanonicalProductSchema: any;
declare const dotenv: any;
declare const uuidv4: any;
declare const SERPAPI_API_KEY: string | undefined;
/**
 * Transforms a raw result from the SerpApi Google Local Services endpoint
 * into the CanonicalProduct schema.
 *
 * @param rawResult - The raw data object from the SerpApi response.
 * @returns A partial CanonicalProduct object.
 */
declare function transformToCanonicalProduct(rawResult: any): {
    canonicalProductId: string;
    title: any;
    address: any;
    images: any;
    description: any;
    price: {
        amount: number;
        currency: string;
    };
    rating: any;
    numRatings: any;
    tags: any;
    sources: {
        provider: string;
        providerProductId: any;
        price: number;
        deliveryEtaMin: null;
        lastFetchedAt: string;
    }[];
    comments: never[];
    popularityScore: number;
    lastFetchedAt: string;
};
/**
 * Fetches local service data from SerpApi for a given query.
 * @param query - The search query (e.g., "pizza in new york").
 * @returns A promise that resolves to an array of CanonicalProduct objects.
 */
declare function fetchAndTransform(query: string): Promise<any>;

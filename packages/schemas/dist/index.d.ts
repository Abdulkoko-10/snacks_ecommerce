import { z } from 'zod';
export declare const PointSchema: z.ZodObject<{
    type: z.ZodLiteral<"Point">;
    coordinates: z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>;
}, "strip", z.ZodTypeAny, {
    type: "Point";
    coordinates: [number, number];
}, {
    type: "Point";
    coordinates: [number, number];
}>;
export declare const CommentSchema: z.ZodObject<{
    id: z.ZodString;
    text: z.ZodString;
    author: z.ZodString;
    origin: z.ZodString;
    rating: z.ZodOptional<z.ZodNumber>;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    text: string;
    author: string;
    origin: string;
    createdAt: string;
    rating?: number | undefined;
}, {
    id: string;
    text: string;
    author: string;
    origin: string;
    createdAt: string;
    rating?: number | undefined;
}>;
export declare const SourceSchema: z.ZodObject<{
    provider: z.ZodString;
    providerProductId: z.ZodString;
    price: z.ZodNumber;
    deliveryEtaMin: z.ZodOptional<z.ZodNumber>;
    lastFetchedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    provider: string;
    providerProductId: string;
    price: number;
    lastFetchedAt: string;
    deliveryEtaMin?: number | undefined;
}, {
    provider: string;
    providerProductId: string;
    price: number;
    lastFetchedAt: string;
    deliveryEtaMin?: number | undefined;
}>;
export declare const CanonicalProductSchema: z.ZodObject<{
    canonicalProductId: z.ZodString;
    title: z.ZodString;
    images: z.ZodArray<z.ZodString, "many">;
    description: z.ZodString;
    location: z.ZodObject<{
        type: z.ZodLiteral<"Point">;
        coordinates: z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>;
    }, "strip", z.ZodTypeAny, {
        type: "Point";
        coordinates: [number, number];
    }, {
        type: "Point";
        coordinates: [number, number];
    }>;
    price: z.ZodObject<{
        amount: z.ZodNumber;
        currency: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        amount: number;
        currency: string;
    }, {
        amount: number;
        currency: string;
    }>;
    rating: z.ZodOptional<z.ZodNumber>;
    numRatings: z.ZodOptional<z.ZodNumber>;
    tags: z.ZodArray<z.ZodString, "many">;
    sources: z.ZodArray<z.ZodObject<{
        provider: z.ZodString;
        providerProductId: z.ZodString;
        price: z.ZodNumber;
        deliveryEtaMin: z.ZodOptional<z.ZodNumber>;
        lastFetchedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        provider: string;
        providerProductId: string;
        price: number;
        lastFetchedAt: string;
        deliveryEtaMin?: number | undefined;
    }, {
        provider: string;
        providerProductId: string;
        price: number;
        lastFetchedAt: string;
        deliveryEtaMin?: number | undefined;
    }>, "many">;
    comments: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        text: z.ZodString;
        author: z.ZodString;
        origin: z.ZodString;
        rating: z.ZodOptional<z.ZodNumber>;
        createdAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        text: string;
        author: string;
        origin: string;
        createdAt: string;
        rating?: number | undefined;
    }, {
        id: string;
        text: string;
        author: string;
        origin: string;
        createdAt: string;
        rating?: number | undefined;
    }>, "many">;
    popularityScore: z.ZodOptional<z.ZodNumber>;
    lastFetchedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    price: {
        amount: number;
        currency: string;
    };
    lastFetchedAt: string;
    canonicalProductId: string;
    title: string;
    images: string[];
    description: string;
    location: {
        type: "Point";
        coordinates: [number, number];
    };
    tags: string[];
    sources: {
        provider: string;
        providerProductId: string;
        price: number;
        lastFetchedAt: string;
        deliveryEtaMin?: number | undefined;
    }[];
    comments: {
        id: string;
        text: string;
        author: string;
        origin: string;
        createdAt: string;
        rating?: number | undefined;
    }[];
    rating?: number | undefined;
    numRatings?: number | undefined;
    popularityScore?: number | undefined;
}, {
    price: {
        amount: number;
        currency: string;
    };
    lastFetchedAt: string;
    canonicalProductId: string;
    title: string;
    images: string[];
    description: string;
    location: {
        type: "Point";
        coordinates: [number, number];
    };
    tags: string[];
    sources: {
        provider: string;
        providerProductId: string;
        price: number;
        lastFetchedAt: string;
        deliveryEtaMin?: number | undefined;
    }[];
    comments: {
        id: string;
        text: string;
        author: string;
        origin: string;
        createdAt: string;
        rating?: number | undefined;
    }[];
    rating?: number | undefined;
    numRatings?: number | undefined;
    popularityScore?: number | undefined;
}>;
export type Point = z.infer<typeof PointSchema>;
export type CanonicalProduct = z.infer<typeof CanonicalProductSchema>;
export type Comment = z.infer<typeof CommentSchema>;
export type Source = z.infer<typeof SourceSchema>;

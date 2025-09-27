import { z } from 'zod';
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
    deliveryEtaMin: z.ZodNullable<z.ZodNumber>;
    lastFetchedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    provider: string;
    providerProductId: string;
    price: number;
    deliveryEtaMin: number | null;
    lastFetchedAt: string;
}, {
    provider: string;
    providerProductId: string;
    price: number;
    deliveryEtaMin: number | null;
    lastFetchedAt: string;
}>;
export declare const CanonicalProductSchema: z.ZodObject<{
    canonicalProductId: z.ZodString;
    title: z.ZodString;
    address: z.ZodString;
    images: z.ZodArray<z.ZodString, "many">;
    description: z.ZodString;
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
    rating: z.ZodNumber;
    numRatings: z.ZodNumber;
    tags: z.ZodArray<z.ZodString, "many">;
    sources: z.ZodArray<z.ZodObject<{
        provider: z.ZodString;
        providerProductId: z.ZodString;
        price: z.ZodNumber;
        deliveryEtaMin: z.ZodNullable<z.ZodNumber>;
        lastFetchedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        provider: string;
        providerProductId: string;
        price: number;
        deliveryEtaMin: number | null;
        lastFetchedAt: string;
    }, {
        provider: string;
        providerProductId: string;
        price: number;
        deliveryEtaMin: number | null;
        lastFetchedAt: string;
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
    popularityScore: z.ZodNumber;
    lastFetchedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    rating: number;
    price: {
        amount: number;
        currency: string;
    };
    lastFetchedAt: string;
    canonicalProductId: string;
    title: string;
    address: string;
    images: string[];
    description: string;
    numRatings: number;
    tags: string[];
    sources: {
        provider: string;
        providerProductId: string;
        price: number;
        deliveryEtaMin: number | null;
        lastFetchedAt: string;
    }[];
    comments: {
        id: string;
        text: string;
        author: string;
        origin: string;
        createdAt: string;
        rating?: number | undefined;
    }[];
    popularityScore: number;
}, {
    rating: number;
    price: {
        amount: number;
        currency: string;
    };
    lastFetchedAt: string;
    canonicalProductId: string;
    title: string;
    address: string;
    images: string[];
    description: string;
    numRatings: number;
    tags: string[];
    sources: {
        provider: string;
        providerProductId: string;
        price: number;
        deliveryEtaMin: number | null;
        lastFetchedAt: string;
    }[];
    comments: {
        id: string;
        text: string;
        author: string;
        origin: string;
        createdAt: string;
        rating?: number | undefined;
    }[];
    popularityScore: number;
}>;
export type Comment = z.infer<typeof CommentSchema>;
export type Source = z.infer<typeof SourceSchema>;
export type CanonicalProduct = z.infer<typeof CanonicalProductSchema>;

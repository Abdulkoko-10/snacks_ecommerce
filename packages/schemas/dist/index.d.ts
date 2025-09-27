import { z } from 'zod';
export declare const CanonicalRestaurantSchema: z.ZodObject<{
    placeId: z.ZodString;
    name: z.ZodString;
    address: z.ZodOptional<z.ZodString>;
    rating: z.ZodOptional<z.ZodNumber>;
    website: z.ZodOptional<z.ZodString>;
    phone_number: z.ZodOptional<z.ZodString>;
    photos: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    deliveryProviders: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    placeId: string;
    name: string;
    address?: string | undefined;
    rating?: number | undefined;
    website?: string | undefined;
    phone_number?: string | undefined;
    photos?: string[] | undefined;
    deliveryProviders?: string[] | undefined;
}, {
    placeId: string;
    name: string;
    address?: string | undefined;
    rating?: number | undefined;
    website?: string | undefined;
    phone_number?: string | undefined;
    photos?: string[] | undefined;
    deliveryProviders?: string[] | undefined;
}>;
export type CanonicalRestaurant = z.infer<typeof CanonicalRestaurantSchema>;

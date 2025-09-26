import { CanonicalProduct } from '@fd/schemas';
export interface EnrichmentData {
    photos?: string[];
    reviews?: {
        author_name: string;
        rating: number;
        text: string;
    }[];
    website?: string;
    rating?: number;
    user_ratings_total?: number;
    serpapiPlaceId?: string;
}
export declare function getEnrichmentData(product: Partial<CanonicalProduct>): Promise<EnrichmentData | null>;

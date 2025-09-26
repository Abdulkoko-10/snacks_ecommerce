import { CanonicalProduct } from '@fd/schemas';
export declare function search(query: string, lat: number, lon: number): Promise<Partial<CanonicalProduct>[]>;

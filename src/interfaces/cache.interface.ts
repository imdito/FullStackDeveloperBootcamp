import { Request } from 'express';



export interface CacheOptions   {
    ttl: number; // time to live in seconds
    prefix?: string; // optional prefix for cache keys
    skipCacheIf?: (req: Request) => boolean; // option to skip cache
    invalidateCache?: string[]; // option to invalidate cache
}

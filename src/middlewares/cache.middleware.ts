import { Request, Response, NextFunction } from 'express';
import { redis_client } from '../configs/redis.config.js';
import crypto from 'crypto';
import { CacheOptions } from '../interfaces/cache.interface.js';


export const MCache = (options: CacheOptions = {
    ttl: 0
}) => {
  const {
    ttl = 300, // Default 5 menit
    prefix = "api_cache",
    skipCacheIf,
    invalidateCache = ["POST", "PUT", "DELETE", "PATCH"],
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (invalidateCache.includes(req.method)) {
        return next();
      }

      if (skipCacheIf && skipCacheIf(req)) {
        return next();
      }

      const cacheKey = generateCacheKey(req, prefix);

      const cachedData = await redis_client.get(cacheKey);

      if (cachedData) {
        const parsed = JSON.parse(cachedData);

        res.setHeader("X-Cache-Status", "HIT");
        res.setHeader("X-Cache-Key", cacheKey);

        console.log("parsed", parsed);
        console.log("typeof parsed", typeof parsed);

        return res.status(parsed.statusCode).json(parsed.data);
      }

      const originalSend = res.send;
      res.send = function (body: any) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const cacheData = {
            statusCode: res.statusCode,
            data: JSON.parse(body),
            timestamp: new Date().toISOString(),
          };

          setImmediate(async () => {
            try {
              await redis_client.setEx(cacheKey, ttl, JSON.stringify(cacheData));
            } catch (error) {
              console.error("Cache set error:", error);
            }
          });
        }

        res.setHeader("X-Cache-Status", "MISS");
        res.setHeader("X-Cache-Key", cacheKey);

        return originalSend.call(this, body);
      };

      next();
    } catch (error) {
      console.error("Cache middleware error:", error);
      next();
    }
  };
};

export const MInvalidateCache = (patterns: string[] = []) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const originalJson = res.json;
      res.json = function (data: any) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          setImmediate(async () => {
            try {
              await invalidateCachePatterns(patterns);
            } catch (error) {
              console.error("Cache invalidation error:", error);
            }
          });
        }

        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error("Cache invalidation middleware error:", error);
      next();
    }
  };
};

const generateCacheKey = (req: Request, prefix: string): string => {
  const url = req.originalUrl || req.url;
  const method = req.method;
  const userAgent = req.get("user-agent") || "";

  const userId = "anonymous";

  const keyData = {
    method,
    url,
    userId,
    userAgent: crypto
      .createHash("md5")
      .update(userAgent)
      .digest("hex")
      .substring(0, 8),
  };

  const keyString = JSON.stringify(keyData);
  const hash = crypto.createHash("md5").update(keyString).digest("hex");

  return `${prefix}:${hash}`;
}

const invalidateCachePatterns = async (patterns: string[]): Promise<void> => {
  if (patterns.length === 0) return;

  for (const pattern of patterns) {
    try {
      const keys = await redis_client.keys(pattern);
      if (keys.length > 0) {
        await redis_client.del(keys);
        console.log(
          `Invalidated ${keys.length} cache entries for pattern: ${pattern}`
        );
      }
    } catch (error) {
      console.error(`Error invalidating cache pattern ${pattern}:`, error);
    }
  }
}
/**
 * CacheService - Serviço de cache com Redis (Upstash)
 * Suporta fallback para in-memory se Redis não estiver disponível
 */

import { logger } from "../logger";

// Lazy load Redis apenas se configurado
let Redis: any;
let redisClient: any = null;

// In-memory fallback cache
const memoryCache = new Map<string, { value: any; expiresAt: number }>();

/**
 * Inicializa cliente Redis (Upstash)
 */
async function getRedisClient() {
  if (!process.env.REDIS_URL) {
    return null;
  }

  if (!redisClient) {
    try {
      Redis = (await import("ioredis")).default;
      redisClient = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        retryStrategy(times: number) {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        enableOfflineQueue: false,
      });

      redisClient.on("error", (err: Error) => {
        logger.error({ err, msg: "Redis connection error" });
      });

      redisClient.on("connect", () => {
        logger.info({ msg: "Redis connected successfully" });
      });
    } catch (error) {
      logger.error({ err: error, msg: "Failed to initialize Redis" });
      return null;
    }
  }

  return redisClient;
}

export class CacheService {
  /**
   * Get valor do cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const redis = await getRedisClient();

      if (redis) {
        const value = await redis.get(key);
        if (!value) return null;
        return JSON.parse(value) as T;
      }

      // Fallback: in-memory cache
      const cached = memoryCache.get(key);
      if (!cached) return null;

      if (Date.now() > cached.expiresAt) {
        memoryCache.delete(key);
        return null;
      }

      return cached.value as T;
    } catch (error) {
      logger.error({ err: error, key, msg: "Cache get error" });
      return null;
    }
  }

  /**
   * Set valor no cache com TTL
   */
  async set(key: string, value: any, ttlSeconds: number): Promise<void> {
    try {
      const redis = await getRedisClient();

      if (redis) {
        await redis.setex(key, ttlSeconds, JSON.stringify(value));
      } else {
        // Fallback: in-memory cache
        memoryCache.set(key, {
          value,
          expiresAt: Date.now() + ttlSeconds * 1000,
        });
      }
    } catch (error) {
      logger.error({ err: error, key, ttl: ttlSeconds, msg: "Cache set error" });
    }
  }

  /**
   * Delete valor do cache
   */
  async delete(key: string): Promise<void> {
    try {
      const redis = await getRedisClient();

      if (redis) {
        await redis.del(key);
      } else {
        memoryCache.delete(key);
      }
    } catch (error) {
      logger.error({ err: error, key, msg: "Cache delete error" });
    }
  }

  /**
   * Delete múltiplos valores por pattern
   */
  async deletePattern(pattern: string): Promise<void> {
    try {
      const redis = await getRedisClient();

      if (redis) {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      } else {
        // Fallback: delete matching keys in memory
        const keysToDelete: string[] = [];
        for (const key of memoryCache.keys()) {
          if (key.includes(pattern.replace("*", ""))) {
            keysToDelete.push(key);
          }
        }
        keysToDelete.forEach(k => memoryCache.delete(k));
      }
    } catch (error) {
      logger.error({ err: error, pattern, msg: "Cache delete pattern error" });
    }
  }

  /**
   * Limpa cache expirado (memory only)
   */
  cleanupExpired(): void {
    const now = Date.now();
    for (const [key, cached] of memoryCache.entries()) {
      if (now > cached.expiresAt) {
        memoryCache.delete(key);
      }
    }
  }
}

// Singleton
export const cacheService = new CacheService();

// Cleanup expired memory cache every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    cacheService.cleanupExpired();
  }, 5 * 60 * 1000);
}

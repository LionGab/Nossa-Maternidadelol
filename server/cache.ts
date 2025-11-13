/**
 * Cache layer using Redis (or in-memory fallback for development)
 * 
 * Provides caching for:
 * - Q&A responses (7 days TTL)
 * - Habit completions (1 hour TTL)
 * - Session store (via express-session)
 */

import { logger } from "./logger";

// In-memory cache fallback (for development without Redis)
class MemoryCache {
  private cache: Map<string, { value: unknown; expiresAt: number }> = new Map();

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value as T;
  }

  async set(key: string, value: any, ttlSeconds: number): Promise<void> {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { value, expiresAt });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    const item = this.cache.get(key);
    if (!item) return false;
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }
}

// Redis client (will be initialized if REDIS_URL is set)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let redisClient: any = null; // Redis client type is dynamic
let memoryCache: MemoryCache | null = null;

// Initialize cache based on environment
async function initializeCache() {
  if (process.env.REDIS_URL) {
    try {
      // Dynamic import to avoid requiring redis in dev
      // @ts-ignore - redis is optional dependency
      const redisModule = await import("redis").catch(() => null);
      if (redisModule) {
        const { createClient } = redisModule;
        redisClient = createClient({ url: process.env.REDIS_URL });
        
        redisClient.on("error", (err: Error) => {
          logger.error({ err, msg: "Redis client error" });
        });
        
        await redisClient.connect();
        logger.info({ msg: "Redis cache initialized" });
      } else {
        throw new Error("Redis module not available");
      }
    } catch (error) {
      logger.warn({ err: error, msg: "Failed to connect to Redis, using memory cache" });
      memoryCache = new MemoryCache();
    }
  } else {
    logger.info({ msg: "Redis not configured, using memory cache" });
    memoryCache = new MemoryCache();
  }
}

// Cache interface
export interface ICache {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown, ttlSeconds: number): Promise<void>;
  del(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
}

// Get cache instance
function getCache(): ICache {
  if (redisClient) {
    return {
      async get<T>(key: string): Promise<T | null> {
        const value = await redisClient.get(key);
        return value ? JSON.parse(value) : null;
      },
      async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
        await redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
      },
      async del(key: string): Promise<void> {
        await redisClient.del(key);
      },
      async exists(key: string): Promise<boolean> {
        return (await redisClient.exists(key)) === 1;
      },
    };
  }
  
  if (!memoryCache) {
    memoryCache = new MemoryCache();
  }
  return memoryCache;
}

// Cache keys
export const CacheKeys = {
  qaCache: (hash: string) => `qa:${hash}`,
  habitCompletions: (userId: string, startDate: string, endDate: string) => 
    `habits:${userId}:${startDate}:${endDate}`,
  userStats: (userId: string) => `stats:${userId}`,
} as const;

// Cache TTLs (in seconds)
export const CacheTTL = {
  QA_RESPONSE: 7 * 24 * 60 * 60, // 7 days
  HABIT_COMPLETIONS: 60 * 60, // 1 hour
  USER_STATS: 30 * 60, // 30 minutes
} as const;

// Initialize on module load
initializeCache().catch((err) => {
  logger.error({ err, msg: "Failed to initialize cache" });
});

export const cache = {
  get: <T>(key: string) => getCache().get<T>(key),
  set: (key: string, value: unknown, ttlSeconds: number) => getCache().set(key, value, ttlSeconds),
  del: (key: string) => getCache().del(key),
  exists: (key: string) => getCache().exists(key),
};

// Export for session store
export { redisClient };


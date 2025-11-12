/**
 * Cache com inicialização adequada e fallback para memory cache
 */
import { createClient } from 'redis';

let cache: Map<string, { value: any; expires: number }> | ReturnType<typeof createClient> | null = null;
let cacheType: 'redis' | 'memory' = 'memory';

/**
 * Inicializa cache (Redis se configurado, senão memory)
 * DEVE ser aguardado antes de usar o cache
 */
export async function initializeCache(): Promise<void> {
  const redisUrl = process.env.REDIS_URL;

  if (redisUrl) {
    try {
      const client = createClient({ url: redisUrl });
      await client.connect();
      cache = client;
      cacheType = 'redis';
      console.log('✅ Cache Redis inicializado');
    } catch (error) {
      console.error('❌ Erro ao conectar Redis, usando memory cache:', error);
      cache = new Map();
      cacheType = 'memory';
    }
  } else {
    cache = new Map();
    cacheType = 'memory';
    console.log('📦 Usando memory cache (Redis não configurado)');
  }
}

/**
 * Obtém valor do cache
 */
export async function getCache(key: string): Promise<any | null> {
  if (!cache) {
    throw new Error('Cache não inicializado. Chame initializeCache() primeiro.');
  }

  if (cacheType === 'redis') {
    const client = cache as ReturnType<typeof createClient>;
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } else {
    const memoryCache = cache as Map<string, { value: any; expires: number }>;
    const item = memoryCache.get(key);
    
    if (!item) return null;
    
    // Verificar expiração
    if (item.expires && Date.now() > item.expires) {
      memoryCache.delete(key);
      return null;
    }
    
    return item.value;
  }
}

/**
 * Define valor no cache
 */
export async function setCache(key: string, value: any, ttlSeconds?: number): Promise<void> {
  if (!cache) {
    throw new Error('Cache não inicializado. Chame initializeCache() primeiro.');
  }

  if (cacheType === 'redis') {
    const client = cache as ReturnType<typeof createClient>;
    if (ttlSeconds) {
      await client.setEx(key, ttlSeconds, JSON.stringify(value));
    } else {
      await client.set(key, JSON.stringify(value));
    }
  } else {
    const memoryCache = cache as Map<string, { value: any; expires: number }>;
    const expires = ttlSeconds ? Date.now() + ttlSeconds * 1000 : 0;
    memoryCache.set(key, { value, expires });
  }
}

/**
 * Deleta valor do cache
 */
export async function deleteCache(key: string): Promise<void> {
  if (!cache) {
    throw new Error('Cache não inicializado. Chame initializeCache() primeiro.');
  }

  if (cacheType === 'redis') {
    const client = cache as ReturnType<typeof createClient>;
    await client.del(key);
  } else {
    const memoryCache = cache as Map<string, { value: any; expires: number }>;
    memoryCache.delete(key);
  }
}

/**
 * Limpa cache expirado (apenas para memory cache)
 */
export function cleanupExpiredCache(): void {
  if (cacheType === 'memory' && cache) {
    const memoryCache = cache as Map<string, { value: any; expires: number }>;
    const now = Date.now();
    
    for (const [key, item] of memoryCache.entries()) {
      if (item.expires && now > item.expires) {
        memoryCache.delete(key);
      }
    }
  }
}

// Limpar cache expirado a cada 5 minutos
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredCache, 5 * 60 * 1000);
}


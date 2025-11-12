/**
 * Health checks robustos para monitoramento
 * Verifica conectividade com todos os serviços críticos
 */
import { db } from './storage/drizzle-storage.js';
import { createClient } from '@supabase/supabase-js';
import * as schema from '../shared/schema.js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
  {
    // Otimizações para Supabase Pro
    auth: {
      persistSession: false,
    },
  }
);

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: {
    database: { status: 'up' | 'down'; latency?: number };
    storage: { status: 'up' | 'down'; latency?: number };
    cache?: { status: 'up' | 'down'; latency?: number };
  };
}

/**
 * Verifica conectividade com banco de dados
 */
async function checkDatabase(): Promise<{ status: 'up' | 'down'; latency?: number }> {
  const start = Date.now();
  try {
    // Query simples para testar conectividade
    await db.select().from(schema.users).limit(1);
    const latency = Date.now() - start;
    return { status: 'up', latency };
  } catch (error) {
    console.error('Database health check failed:', error);
    return { status: 'down' };
  }
}

/**
 * Verifica conectividade com Supabase Storage
 */
async function checkStorage(): Promise<{ status: 'up' | 'down'; latency?: number }> {
  const start = Date.now();
  try {
    // Listar buckets para testar conectividade
    const { data, error } = await supabase.storage.listBuckets();
    const latency = Date.now() - start;
    
    if (error) {
      return { status: 'down' };
    }
    
    return { status: 'up', latency };
  } catch (error) {
    console.error('Storage health check failed:', error);
    return { status: 'down' };
  }
}

/**
 * Verifica conectividade com cache (Redis se configurado)
 */
async function checkCache(): Promise<{ status: 'up' | 'down'; latency?: number } | undefined> {
  // Se cache não estiver configurado, retorna undefined
  if (!process.env.REDIS_URL) {
    return undefined;
  }

  const start = Date.now();
  try {
    const { getCache } = await import('./cache.js');
    await getCache('health-check-test');
    const latency = Date.now() - start;
    return { status: 'up', latency };
  } catch (error) {
    console.error('Cache health check failed:', error);
    return { status: 'down' };
  }
}

/**
 * Health check completo
 * Retorna 200 se tudo OK, 503 se algum serviço down
 */
export async function getHealthStatus(): Promise<HealthStatus> {
  const [dbStatus, storageStatus, cacheStatus] = await Promise.all([
    checkDatabase(),
    checkStorage(),
    checkCache(),
  ]);

  // Determinar status geral
  let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  
  if (dbStatus.status === 'down' || storageStatus.status === 'down') {
    overallStatus = 'unhealthy';
  } else if (cacheStatus && cacheStatus.status === 'down') {
    overallStatus = 'degraded'; // Cache down não é crítico
  }

  return {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    services: {
      database: dbStatus,
      storage: storageStatus,
      ...(cacheStatus && { cache: cacheStatus }),
    },
  };
}


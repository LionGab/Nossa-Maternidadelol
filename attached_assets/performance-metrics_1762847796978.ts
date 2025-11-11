/**
 * Performance Metrics Service
 *
 * Rastreia métricas de performance da NAT-IA:
 * - Latência (p50, p95, p99) - SLO: p50 < 2.5s, p95 < 5s
 * - Uso de tokens e custos
 * - Taxa de erros
 * - Disponibilidade
 *
 * PRIVACIDADE: Não registra conteúdo de mensagens, apenas metadados
 */

import { supabase } from '../supabase';
import type { LatencyMetric, TokenUsage, ErrorMetric, PerformanceMetrics } from './types';
import { logger } from '@/utils/logger';

// ============= LATÊNCIA =============

/**
 * Registra latência de um endpoint
 * SLO: p50 < 2500ms, p95 < 5000ms
 */
export const trackLatencia = async (endpoint: string, latency_ms: number, status_code: number = 200): Promise<void> => {
  try {
    const metric: Partial<LatencyMetric> = {
      endpoint,
      latency_ms,
      status_code,
      timestamp: new Date(),
    };

    const { error } = await supabase.from('nathia_performance_logs').insert(metric);

    if (error) throw error;

    // Verificar SLO
    if (latency_ms > 5000) {
      await triggerLatencyAlert(endpoint, latency_ms);
    }
  } catch (error) {
    logger.error('Erro ao registrar latência:', error);
  }
};

/**
 * Calcula percentis de latência
 */
export const getLatencyPercentiles = async (
  endpoint?: string,
  periodo: string = '24h'
): Promise<{ p50: number; p95: number; p99: number }> => {
  try {
    const dataInicio = getDataInicio(periodo);

    let query = supabase
      .from('nathia_performance_logs')
      .select('latency_ms')
      .gte('timestamp', dataInicio.toISOString())
      .order('latency_ms', { ascending: true });

    if (endpoint) {
      query = query.eq('endpoint', endpoint);
    }

    const { data, error } = await query;

    if (error) throw error;

    if (!data || data.length === 0) {
      return { p50: 0, p95: 0, p99: 0 };
    }

    const latencies = data.map((d) => d.latency_ms);
    const p50 = calculatePercentile(latencies, 50);
    const p95 = calculatePercentile(latencies, 95);
    const p99 = calculatePercentile(latencies, 99);

    return { p50, p95, p99 };
  } catch (error) {
    logger.error('Erro ao calcular percentis:', error);
    return { p50: 0, p95: 0, p99: 0 };
  }
};

/**
 * Verifica se SLO de latência está sendo atendido
 */
export const checkLatencySLO = async (
  periodo: string = '24h'
): Promise<{
  p50: { atual: number; slo: number; ok: boolean };
  p95: { atual: number; slo: number; ok: boolean };
}> => {
  const { p50, p95 } = await getLatencyPercentiles(undefined, periodo);

  return {
    p50: {
      atual: p50,
      slo: 2500,
      ok: p50 < 2500,
    },
    p95: {
      atual: p95,
      slo: 5000,
      ok: p95 < 5000,
    },
  };
};

// ============= TOKENS E CUSTOS =============

/**
 * Registra uso de tokens e custos por modelo
 * Gemini 2.0 Flash: ~$0.0001/1K tokens input, ~$0.0003/1K tokens output
 */
export const trackTokens = async (
  model: 'gemini-2.0-flash' | 'gemini-1.5-flash' | 'gemini-1.5-pro',
  input_tokens: number,
  output_tokens: number,
  session_id: string
): Promise<number> => {
  try {
    const cost_usd = calculateCost(model, input_tokens, output_tokens);

    const usage: Partial<TokenUsage> = {
      model,
      input_tokens,
      output_tokens,
      cost_usd,
      session_id,
      timestamp: new Date(),
    };

    const { error } = await supabase.from('nathia_token_usage').insert(usage);

    if (error) throw error;

    return cost_usd;
  } catch (error) {
    logger.error('Erro ao registrar tokens:', error);
    return 0;
  }
};

/**
 * Calcula custo baseado no modelo e tokens
 */
const calculateCost = (model: string, input_tokens: number, output_tokens: number): number => {
  // Custos por 1K tokens (USD)
  const costs: Record<string, { input: number; output: number }> = {
    'gemini-2.0-flash': {
      input: 0.0001, // $0.10/M tokens
      output: 0.0003, // $0.30/M tokens
    },
    'gemini-1.5-flash': {
      input: 0.00015,
      output: 0.0006,
    },
    'gemini-1.5-pro': {
      input: 0.00125,
      output: 0.00375,
    },
  };

  const modelCost = costs[model] || costs['gemini-2.0-flash'];

  const inputCost = (input_tokens / 1000) * modelCost.input;
  const outputCost = (output_tokens / 1000) * modelCost.output;

  return inputCost + outputCost;
};

/**
 * Retorna estatísticas de tokens por período
 */
export const getTokenStats = async (
  periodo: string = '24h'
): Promise<{
  total_input_tokens: number;
  total_output_tokens: number;
  total_cost_usd: number;
  avg_tokens_per_message: number;
  breakdown_by_model: Record<string, { tokens: number; cost: number }>;
}> => {
  try {
    const dataInicio = getDataInicio(periodo);

    const { data, error } = await supabase
      .from('nathia_token_usage')
      .select('*')
      .gte('timestamp', dataInicio.toISOString());

    if (error) throw error;

    if (!data || data.length === 0) {
      return {
        total_input_tokens: 0,
        total_output_tokens: 0,
        total_cost_usd: 0,
        avg_tokens_per_message: 0,
        breakdown_by_model: {},
      };
    }

    const total_input_tokens = data.reduce((acc, d) => acc + d.input_tokens, 0);
    const total_output_tokens = data.reduce((acc, d) => acc + d.output_tokens, 0);
    const total_cost_usd = data.reduce((acc, d) => acc + d.cost_usd, 0);
    const avg_tokens_per_message = (total_input_tokens + total_output_tokens) / data.length;

    // Breakdown por modelo
    const breakdown_by_model: Record<string, { tokens: number; cost: number }> = {};

    data.forEach((d) => {
      if (!breakdown_by_model[d.model]) {
        breakdown_by_model[d.model] = { tokens: 0, cost: 0 };
      }
      breakdown_by_model[d.model].tokens += d.input_tokens + d.output_tokens;
      breakdown_by_model[d.model].cost += d.cost_usd;
    });

    return {
      total_input_tokens,
      total_output_tokens,
      total_cost_usd,
      avg_tokens_per_message,
      breakdown_by_model,
    };
  } catch (error) {
    logger.error('Erro ao calcular estatísticas de tokens:', error);
    return {
      total_input_tokens: 0,
      total_output_tokens: 0,
      total_cost_usd: 0,
      avg_tokens_per_message: 0,
      breakdown_by_model: {},
    };
  }
};

// ============= ERROS =============

/**
 * Registra erro de API/sistema
 */
export const trackError = async (
  endpoint: string,
  error_type: string,
  error_message: string,
  stack_trace?: string,
  user_id_hash?: string
): Promise<void> => {
  try {
    const metric: Partial<ErrorMetric> = {
      endpoint,
      error_type,
      error_message: error_message.substring(0, 500), // Limitar tamanho
      stack_trace: stack_trace?.substring(0, 2000), // Limitar tamanho
      user_id_hash,
      timestamp: new Date(),
    };

    const { error } = await supabase.from('nathia_performance_logs').insert(metric);

    if (error) throw error;

    // Verificar taxa de erros
    await checkErrorRate();
  } catch (error) {
    logger.error('Erro ao registrar erro:', error);
  }
};

/**
 * Calcula taxa de erros
 */
export const getErrorRate = async (periodo: string = '24h'): Promise<number> => {
  try {
    const dataInicio = getDataInicio(periodo);

    const { data, error } = await supabase
      .from('nathia_performance_logs')
      .select('status_code')
      .gte('timestamp', dataInicio.toISOString());

    if (error) throw error;

    if (!data || data.length === 0) return 0;

    const erros = data.filter((d) => d.status_code >= 400).length;
    const total = data.length;

    return (erros / total) * 100;
  } catch (error) {
    logger.error('Erro ao calcular taxa de erros:', error);
    return 0;
  }
};

/**
 * Verifica se taxa de erros está acima do limite (1%)
 */
const checkErrorRate = async (): Promise<void> => {
  const errorRate = await getErrorRate('1h');

  if (errorRate > 1) {
    await triggerErrorRateAlert(errorRate);
  }
};

// ============= DISPONIBILIDADE =============

/**
 * Calcula disponibilidade (uptime)
 * SLO: ≥ 99.5%
 */
export const getDisponibilidade = async (periodo: string = '30d'): Promise<number> => {
  try {
    const dataInicio = getDataInicio(periodo);

    const { data, error } = await supabase
      .from('nathia_performance_logs')
      .select('status_code')
      .gte('timestamp', dataInicio.toISOString());

    if (error) throw error;

    if (!data || data.length === 0) return 100;

    const sucesso = data.filter((d) => d.status_code >= 200 && d.status_code < 500).length;
    const total = data.length;

    return (sucesso / total) * 100;
  } catch (error) {
    logger.error('Erro ao calcular disponibilidade:', error);
    return 100;
  }
};

// ============= MÉTRICAS CONSOLIDADAS =============

/**
 * Retorna todas as métricas de performance consolidadas
 */
export const getPerformanceMetrics = async (periodo: string = '24h'): Promise<PerformanceMetrics> => {
  const [percentiles, errorRate, disponibilidade] = await Promise.all([
    getLatencyPercentiles(undefined, periodo),
    getErrorRate(periodo),
    getDisponibilidade(periodo),
  ]);

  return {
    latencia_p50_ms: percentiles.p50,
    latencia_p95_ms: percentiles.p95,
    latencia_p99_ms: percentiles.p99,
    taxa_erro_percent: errorRate,
    disponibilidade_percent: disponibilidade,
  };
};

// ============= HELPERS =============

/**
 * Calcula percentil de um array de números
 */
const calculatePercentile = (values: number[], percentile: number): number => {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;

  return sorted[index] || 0;
};

/**
 * Converte período em data de início
 */
const getDataInicio = (periodo: string): Date => {
  const agora = new Date();

  switch (periodo) {
    case '1h':
      return new Date(agora.getTime() - 60 * 60 * 1000);
    case '24h':
      return new Date(agora.getTime() - 24 * 60 * 60 * 1000);
    case '7d':
      return new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '90d':
      return new Date(agora.getTime() - 90 * 24 * 60 * 60 * 1000);
    default:
      return new Date(agora.getTime() - 24 * 60 * 60 * 1000);
  }
};

/**
 * Dispara alerta de latência alta
 */
const triggerLatencyAlert = async (endpoint: string, latency_ms: number): Promise<void> => {
  try {
    const { default: alerts } = await import('./alerts');
    await alerts.alertIfLatencySpike(endpoint, latency_ms);
  } catch (error) {
    logger.error('Erro ao disparar alerta de latência:', error);
  }
};

/**
 * Dispara alerta de taxa de erros alta
 */
const triggerErrorRateAlert = async (errorRate: number): Promise<void> => {
  try {
    const { default: alerts } = await import('./alerts');
    await alerts.alertIfErrorRateHigh(errorRate);
  } catch (error) {
    logger.error('Erro ao disparar alerta de erro:', error);
  }
};

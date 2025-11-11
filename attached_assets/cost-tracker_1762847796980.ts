/**
 * Cost Tracker Service
 *
 * Rastreamento e otimização de custos NAT-IA:
 * - Custo por modelo (Gemini 2.0 Flash, etc)
 * - Estimativas mensais
 * - Recomendações de economia
 * - Breakdown por categoria
 *
 * CUSTOS GEMINI (Fev 2025):
 * - Gemini 2.0 Flash: $0.10/M input tokens, $0.30/M output tokens
 * - Gemini 1.5 Flash: $0.15/M input tokens, $0.60/M output tokens
 * - Gemini 1.5 Pro: $1.25/M input tokens, $3.75/M output tokens
 */

import { supabase } from '../supabase';
import type { CostMetrics, ModelCostConfig, CostOptimization } from './types';
import { logger } from '@/utils/logger';

// ============= CONFIGURAÇÃO DE CUSTOS =============

const MODEL_COSTS: Record<string, ModelCostConfig> = {
  'gemini-2.0-flash': {
    model: 'gemini-2.0-flash',
    input_cost_per_1k: 0.0001, // $0.10/M tokens
    output_cost_per_1k: 0.0003, // $0.30/M tokens
    cache_hit_discount: 0.5, // 50% desconto em cache hit
  },
  'gemini-1.5-flash': {
    model: 'gemini-1.5-flash',
    input_cost_per_1k: 0.00015, // $0.15/M tokens
    output_cost_per_1k: 0.0006, // $0.60/M tokens
  },
  'gemini-1.5-pro': {
    model: 'gemini-1.5-pro',
    input_cost_per_1k: 0.00125, // $1.25/M tokens
    output_cost_per_1k: 0.00375, // $3.75/M tokens
  },
};

// Custos adicionais (estimados)
const SUPABASE_COST_MONTHLY = 25; // Plano Pro
const OTHER_SERVICES_MONTHLY = 10; // Sentry, etc

// ============= CÁLCULO DE CUSTOS =============

/**
 * Calcula custo de uma chamada de API
 */
export const calculateCallCost = (
  model: string,
  input_tokens: number,
  output_tokens: number,
  cache_hit: boolean = false
): number => {
  const config = MODEL_COSTS[model] || MODEL_COSTS['gemini-2.0-flash'];

  let input_cost = (input_tokens / 1000) * config.input_cost_per_1k;
  const output_cost = (output_tokens / 1000) * config.output_cost_per_1k;

  // Aplicar desconto de cache se aplicável
  if (cache_hit && config.cache_hit_discount) {
    input_cost *= config.cache_hit_discount;
  }

  return input_cost + output_cost;
};

/**
 * Retorna custos por modelo
 */
export const trackByModel = async (
  periodo: string = '30d'
): Promise<
  Record<
    string,
    {
      total_tokens: number;
      total_cost: number;
      calls: number;
      avg_cost_per_call: number;
    }
  >
> => {
  try {
    const dataInicio = getDataInicio(periodo);

    const { data, error } = await supabase
      .from('nathia_token_usage')
      .select('*')
      .gte('timestamp', dataInicio.toISOString());

    if (error) throw error;

    if (!data || data.length === 0) return {};

    const byModel: Record<
      string,
      {
        total_tokens: number;
        total_cost: number;
        calls: number;
      }
    > = {};

    data.forEach((d) => {
      if (!byModel[d.model]) {
        byModel[d.model] = {
          total_tokens: 0,
          total_cost: 0,
          calls: 0,
        };
      }

      byModel[d.model].total_tokens += d.input_tokens + d.output_tokens;
      byModel[d.model].total_cost += d.cost_usd;
      byModel[d.model].calls++;
    });

    // Adicionar média por chamada
    const result: any = {};
    Object.entries(byModel).forEach(([model, stats]) => {
      result[model] = {
        ...stats,
        avg_cost_per_call: stats.total_cost / stats.calls,
      };
    });

    return result;
  } catch (error) {
    logger.error('Erro ao calcular custos por modelo:', error);
    return {};
  }
};

// ============= MÉTRICAS DE CUSTO =============

/**
 * Calcula custos do período
 */
export const getCostMetrics = async (periodo: string = '30d'): Promise<CostMetrics> => {
  try {
    const dataInicio = getDataInicio(periodo);

    // Custos de API
    const { data, error } = await supabase
      .from('nathia_token_usage')
      .select('cost_usd, session_id')
      .gte('timestamp', dataInicio.toISOString());

    if (error) throw error;

    const gemini_cost = data?.reduce((acc, d) => acc + d.cost_usd, 0) || 0;

    // Calcular métricas diárias
    const dias = Math.ceil((new Date().getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24));

    const custo_diario_usd = gemini_cost / dias;

    // Estimar custo mensal
    const supabase_mensal = periodo === '30d' ? SUPABASE_COST_MONTHLY : 0;
    const outros_mensal = periodo === '30d' ? OTHER_SERVICES_MONTHLY : 0;

    const custo_mensal_estimado_usd = custo_diario_usd * 30 + supabase_mensal + outros_mensal;

    // Custo por usuário e por mensagem
    const sessoes_unicas = new Set(data?.map((d) => d.session_id) || []).size;
    const mensagens = data?.length || 1;

    const custo_por_usuario_usd = gemini_cost / (sessoes_unicas || 1);
    const custo_por_mensagem_usd = gemini_cost / mensagens;

    return {
      custo_diario_usd,
      custo_mensal_estimado_usd,
      custo_por_usuario_usd,
      custo_por_mensagem_usd,
      breakdown: {
        gemini_api: gemini_cost,
        supabase: supabase_mensal,
        outros: outros_mensal,
      },
    };
  } catch (error) {
    logger.error('Erro ao calcular métricas de custo:', error);
    return {
      custo_diario_usd: 0,
      custo_mensal_estimado_usd: 0,
      custo_por_usuario_usd: 0,
      custo_por_mensagem_usd: 0,
      breakdown: {
        gemini_api: 0,
        supabase: 0,
        outros: 0,
      },
    };
  }
};

/**
 * Estima custo mensal baseado em uso atual
 */
export const estimarCustoMensal = async (metricas_uso?: {
  mensagens_diarias: number;
  tokens_medio_por_mensagem: number;
}): Promise<{
  estimativa_conservadora: number;
  estimativa_realista: number;
  estimativa_otimista: number;
  detalhamento: any;
}> => {
  try {
    // Se não fornecido, calcular baseado em últimos 7 dias
    let mensagens_diarias = metricas_uso?.mensagens_diarias;
    let tokens_medio = metricas_uso?.tokens_medio_por_mensagem;

    if (!mensagens_diarias || !tokens_medio) {
      const { data, error } = await supabase
        .from('nathia_token_usage')
        .select('*')
        .gte('timestamp', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      const total_msgs = data?.length || 0;
      mensagens_diarias = total_msgs / 7;

      const total_tokens = data?.reduce((acc, d) => acc + d.input_tokens + d.output_tokens, 0) || 0;
      tokens_medio = total_tokens / total_msgs;
    }

    // Calcular para Gemini 2.0 Flash (modelo padrão)
    const config = MODEL_COSTS['gemini-2.0-flash'];

    // Assumir 40% input, 60% output (típico para chat)
    const input_tokens = tokens_medio * 0.4;
    const output_tokens = tokens_medio * 0.6;

    const custo_por_mensagem =
      (input_tokens / 1000) * config.input_cost_per_1k + (output_tokens / 1000) * config.output_cost_per_1k;

    // Cenários
    const conservador = {
      mensagens_diarias: mensagens_diarias * 1.5, // +50% buffer
      custo_mensal: mensagens_diarias * 1.5 * 30 * custo_por_mensagem,
    };

    const realista = {
      mensagens_diarias,
      custo_mensal: mensagens_diarias * 30 * custo_por_mensagem,
    };

    const otimista = {
      mensagens_diarias: mensagens_diarias * 0.8, // -20% com cache
      custo_mensal: mensagens_diarias * 0.8 * 30 * custo_por_mensagem * 0.7, // 30% economia cache
    };

    // Adicionar custos fixos
    const custos_fixos = SUPABASE_COST_MONTHLY + OTHER_SERVICES_MONTHLY;

    return {
      estimativa_conservadora: conservador.custo_mensal + custos_fixos,
      estimativa_realista: realista.custo_mensal + custos_fixos,
      estimativa_otimista: otimista.custo_mensal + custos_fixos,
      detalhamento: {
        conservador: { ...conservador, custos_fixos },
        realista: { ...realista, custos_fixos },
        otimista: { ...otimista, custos_fixos },
        custo_por_mensagem,
        tokens_medio,
      },
    };
  } catch (error) {
    logger.error('Erro ao estimar custo mensal:', error);
    return {
      estimativa_conservadora: 0,
      estimativa_realista: 0,
      estimativa_otimista: 0,
      detalhamento: {},
    };
  }
};

// ============= OTIMIZAÇÕES =============

/**
 * Sugere otimizações de custo
 */
export const sugerirOtimizacoes = async (): Promise<CostOptimization[]> => {
  const otimizacoes: CostOptimization[] = [];

  try {
    // Analisar uso de modelos
    const byModel = await trackByModel('30d');

    // Sugestão 1: Usar Gemini 2.0 Flash em vez de 1.5 Pro
    if (byModel['gemini-1.5-pro']) {
      const economia_mes =
        byModel['gemini-1.5-pro'].total_cost *
        30 *
        (1 - MODEL_COSTS['gemini-2.0-flash'].input_cost_per_1k / MODEL_COSTS['gemini-1.5-pro'].input_cost_per_1k);

      otimizacoes.push({
        recomendacao: 'Migrar de Gemini 1.5 Pro para 2.0 Flash',
        economia_estimada_usd_mes: economia_mes,
        impacto_qualidade: 'baixo',
        implementacao: 'facil',
      });
    }

    // Sugestão 2: Implementar cache de contexto
    const { data: totalTokens } = await supabase
      .from('nathia_token_usage')
      .select('input_tokens')
      .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (totalTokens) {
      const total_input = totalTokens.reduce((acc, d) => acc + d.input_tokens, 0);
      const economia_cache = (total_input / 1000) * MODEL_COSTS['gemini-2.0-flash'].input_cost_per_1k * 0.5; // 50% cache hit

      otimizacoes.push({
        recomendacao: 'Implementar cache de contexto (Gemini Context Caching)',
        economia_estimada_usd_mes: economia_cache,
        impacto_qualidade: 'nenhum',
        implementacao: 'media',
      });
    }

    // Sugestão 3: Otimizar prompts (reduzir tokens)
    const { data: tokenStats } = await supabase
      .from('nathia_token_usage')
      .select('input_tokens, output_tokens')
      .gte('timestamp', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (tokenStats && tokenStats.length > 0) {
      const avg_tokens = tokenStats.reduce((acc, d) => acc + d.input_tokens + d.output_tokens, 0) / tokenStats.length;

      if (avg_tokens > 2000) {
        const economia_otimizacao =
          ((avg_tokens - 1500) / 1000) * MODEL_COSTS['gemini-2.0-flash'].output_cost_per_1k * tokenStats.length * 30;

        otimizacoes.push({
          recomendacao: 'Otimizar prompts para reduzir tokens (objetivo: <1500 tokens/msg)',
          economia_estimada_usd_mes: economia_otimizacao,
          impacto_qualidade: 'baixo',
          implementacao: 'media',
        });
      }
    }

    // Sugestão 4: Implementar rate limiting inteligente
    otimizacoes.push({
      recomendacao: 'Implementar rate limiting inteligente (evitar spam)',
      economia_estimada_usd_mes: 15, // Estimativa
      impacto_qualidade: 'nenhum',
      implementacao: 'facil',
    });

    // Sugestão 5: Usar streaming (reduz timeouts e custos)
    otimizacoes.push({
      recomendacao: 'Implementar streaming de respostas (Gemini Streaming)',
      economia_estimada_usd_mes: 5,
      impacto_qualidade: 'nenhum',
      implementacao: 'media',
    });

    // Ordenar por economia (maior primeiro)
    otimizacoes.sort((a, b) => b.economia_estimada_usd_mes - a.economia_estimada_usd_mes);

    return otimizacoes;
  } catch (error) {
    logger.error('Erro ao sugerir otimizações:', error);
    return otimizacoes;
  }
};

/**
 * Calcula ROI de implementar uma otimização
 */
export const calculateOptimizationROI = (
  economia_mensal: number,
  custo_implementacao_horas: number,
  custo_hora_dev: number = 50
): {
  custo_implementacao: number;
  payback_meses: number;
  roi_anual: number;
  vale_a_pena: boolean;
} => {
  const custo_implementacao = custo_implementacao_horas * custo_hora_dev;
  const payback_meses = custo_implementacao / economia_mensal;
  const economia_anual = economia_mensal * 12;
  const roi_anual = ((economia_anual - custo_implementacao) / custo_implementacao) * 100;
  const vale_a_pena = payback_meses < 6; // ROI em menos de 6 meses

  return {
    custo_implementacao,
    payback_meses,
    roi_anual,
    vale_a_pena,
  };
};

// ============= RELATÓRIOS =============

/**
 * Gera relatório de custos completo
 */
export const gerarRelatorioCustos = async (
  periodo: string = '30d'
): Promise<{
  resumo: CostMetrics;
  por_modelo: any;
  estimativa_mensal: any;
  otimizacoes: CostOptimization[];
  tendencia: string;
}> => {
  try {
    const [resumo, por_modelo, estimativa, otimizacoes] = await Promise.all([
      getCostMetrics(periodo),
      trackByModel(periodo),
      estimarCustoMensal(),
      sugerirOtimizacoes(),
    ]);

    // Calcular tendência (comparar com período anterior)
    const custo_atual = resumo.custo_diario_usd;
    const dataInicio = getDataInicio(periodo);
    const dias = Math.ceil((new Date().getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24));

    const { data: periodoAnterior } = await supabase
      .from('nathia_token_usage')
      .select('cost_usd')
      .lt('timestamp', dataInicio.toISOString())
      .gte('timestamp', new Date(dataInicio.getTime() - dias * 24 * 60 * 60 * 1000).toISOString());

    const custo_anterior = (periodoAnterior?.reduce((acc, d) => acc + d.cost_usd, 0) || 0) / dias;

    let tendencia = 'estável';
    if (custo_atual > custo_anterior * 1.1) {
      tendencia = 'crescente';
    } else if (custo_atual < custo_anterior * 0.9) {
      tendencia = 'decrescente';
    }

    return {
      resumo,
      por_modelo,
      estimativa_mensal: estimativa,
      otimizacoes,
      tendencia,
    };
  } catch (error) {
    logger.error('Erro ao gerar relatório de custos:', error);
    return {
      resumo: {
        custo_diario_usd: 0,
        custo_mensal_estimado_usd: 0,
        custo_por_usuario_usd: 0,
        custo_por_mensagem_usd: 0,
        breakdown: { gemini_api: 0, supabase: 0, outros: 0 },
      },
      por_modelo: {},
      estimativa_mensal: {},
      otimizacoes: [],
      tendencia: 'desconhecida',
    };
  }
};

// ============= HELPERS =============

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
      return new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
};

// Export default
export default {
  calculateCallCost,
  trackByModel,
  getCostMetrics,
  estimarCustoMensal,
  sugerirOtimizacoes,
  calculateOptimizationROI,
  gerarRelatorioCustos,
};

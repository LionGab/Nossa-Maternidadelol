/**
 * A/B Testing Service
 *
 * Sistema de experimentação para NAT-IA:
 * - Atribuição de variantes
 * - Rastreamento de métricas por variante
 * - Análise estatística de resultados
 * - Testes: prompts, modelos, UX
 *
 * PRIVACIDADE: user_id é hasheado para garantir anonimato
 */

import { supabase } from '../supabase';
import { createHash } from 'crypto';
import type { Experiment, ExperimentAssignment, ExperimentMetric } from './types';
import { logger } from '@/utils/logger';

// ============= GESTÃO DE EXPERIMENTOS =============

/**
 * Cria um novo experimento A/B
 */
export const createExperiment = async (
  name: string,
  description: string,
  variants: string[],
  target_metric: string,
  sample_size_per_variant: number
): Promise<string | null> => {
  try {
    const experiment: Partial<Experiment> = {
      name,
      description,
      variants,
      status: 'draft',
      start_date: new Date(),
      target_metric,
      sample_size_per_variant,
    };

    const { data, error } = await supabase.from('nathia_experiments').insert(experiment).select().single();

    if (error) throw error;

    return data?.experiment_id || null;
  } catch (error) {
    logger.error('Erro ao criar experimento:', error);
    return null;
  }
};

/**
 * Inicia um experimento (muda status para running)
 */
export const startExperiment = async (experiment_id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('nathia_experiments')
      .update({
        status: 'running',
        start_date: new Date().toISOString(),
      })
      .eq('experiment_id', experiment_id);

    if (error) throw error;
  } catch (error) {
    logger.error('Erro ao iniciar experimento:', error);
  }
};

/**
 * Pausa um experimento
 */
export const pauseExperiment = async (experiment_id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('nathia_experiments')
      .update({ status: 'paused' })
      .eq('experiment_id', experiment_id);

    if (error) throw error;
  } catch (error) {
    logger.error('Erro ao pausar experimento:', error);
  }
};

/**
 * Finaliza um experimento
 */
export const completeExperiment = async (experiment_id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('nathia_experiments')
      .update({
        status: 'completed',
        end_date: new Date().toISOString(),
      })
      .eq('experiment_id', experiment_id);

    if (error) throw error;
  } catch (error) {
    logger.error('Erro ao finalizar experimento:', error);
  }
};

/**
 * Lista todos os experimentos
 */
export const listExperiments = async (status?: 'draft' | 'running' | 'paused' | 'completed'): Promise<Experiment[]> => {
  try {
    let query = supabase.from('nathia_experiments').select('*').order('start_date', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  } catch (error) {
    logger.error('Erro ao listar experimentos:', error);
    return [];
  }
};

// ============= ATRIBUIÇÃO DE VARIANTES =============

/**
 * Atribui uma variante para um usuário
 * Usa hash consistente para garantir mesma variante
 */
export const assignVariant = async (
  user_id: string,
  experiment_name: string
): Promise<'control' | 'variant' | null> => {
  try {
    // Buscar experimento
    const { data: experiment, error: expError } = await supabase
      .from('nathia_experiments')
      .select('*')
      .eq('name', experiment_name)
      .eq('status', 'running')
      .single();

    if (expError || !experiment) {
      logger.info(`Experimento ${experiment_name} não encontrado ou não está rodando`);
      return null;
    }

    // Hash do user_id para privacidade
    const user_id_hash = hashUserId(user_id);

    // Verificar se já tem atribuição
    const { data: existing, error: existingError } = await supabase
      .from('nathia_experiment_assignments')
      .select('variant')
      .eq('user_id_hash', user_id_hash)
      .eq('experiment_id', experiment.experiment_id)
      .single();

    if (existing) {
      return existing.variant;
    }

    // Atribuir nova variante (hash consistente)
    const variant = selectVariant(user_id_hash, experiment.variants);

    const assignment: Partial<ExperimentAssignment> = {
      user_id_hash,
      experiment_id: experiment.experiment_id,
      variant,
      assigned_at: new Date(),
    };

    const { error: assignError } = await supabase.from('nathia_experiment_assignments').insert(assignment);

    if (assignError) throw assignError;

    return variant as 'control' | 'variant';
  } catch (error) {
    logger.error('Erro ao atribuir variante:', error);
    return null;
  }
};

/**
 * Seleciona variante baseada em hash (consistente)
 */
const selectVariant = (user_id_hash: string, variants: string[]): string => {
  // Usar primeiros bytes do hash para determinar variante
  const hashValue = parseInt(user_id_hash.substring(0, 8), 16);
  const index = hashValue % variants.length;

  return variants[index];
};

/**
 * Retorna variante atual do usuário para um experimento
 */
export const getUserVariant = async (user_id: string, experiment_name: string): Promise<string | null> => {
  try {
    const user_id_hash = hashUserId(user_id);

    const { data: experiment, error: expError } = await supabase
      .from('nathia_experiments')
      .select('experiment_id')
      .eq('name', experiment_name)
      .single();

    if (expError || !experiment) return null;

    const { data, error } = await supabase
      .from('nathia_experiment_assignments')
      .select('variant')
      .eq('user_id_hash', user_id_hash)
      .eq('experiment_id', experiment.experiment_id)
      .single();

    if (error) return null;

    return data?.variant || null;
  } catch (error) {
    logger.error('Erro ao buscar variante do usuário:', error);
    return null;
  }
};

// ============= RASTREAMENTO DE MÉTRICAS =============

/**
 * Registra métrica de experimento
 */
export const trackExperimentMetric = async (
  experiment_id: string,
  variant: string,
  metric_name: string,
  metric_value: number
): Promise<void> => {
  try {
    const metric: Partial<ExperimentMetric> = {
      experiment_id,
      variant,
      metric_name,
      metric_value,
      sample_size: 1,
      timestamp: new Date(),
    };

    const { error } = await supabase.from('nathia_experiment_metrics').insert(metric);

    if (error) throw error;
  } catch (error) {
    logger.error('Erro ao registrar métrica de experimento:', error);
  }
};

/**
 * Calcula métricas agregadas por variante
 */
export const getExperimentResults = async (
  experiment_id: string
): Promise<
  Record<
    string,
    {
      sample_size: number;
      metrics: Record<string, { mean: number; stddev: number; count: number }>;
    }
  >
> => {
  try {
    const { data, error } = await supabase
      .from('nathia_experiment_metrics')
      .select('*')
      .eq('experiment_id', experiment_id);

    if (error) throw error;

    if (!data || data.length === 0) return {};

    // Agrupar por variante
    const results: Record<
      string,
      {
        sample_size: number;
        metrics: Record<string, { values: number[] }>;
      }
    > = {};

    data.forEach((d) => {
      if (!results[d.variant]) {
        results[d.variant] = {
          sample_size: 0,
          metrics: {},
        };
      }

      if (!results[d.variant].metrics[d.metric_name]) {
        results[d.variant].metrics[d.metric_name] = { values: [] };
      }

      results[d.variant].metrics[d.metric_name].values.push(d.metric_value);
      results[d.variant].sample_size++;
    });

    // Calcular estatísticas
    const finalResults: Record<
      string,
      {
        sample_size: number;
        metrics: Record<string, { mean: number; stddev: number; count: number }>;
      }
    > = {};

    Object.entries(results).forEach(([variant, data]) => {
      finalResults[variant] = {
        sample_size: data.sample_size,
        metrics: {},
      };

      Object.entries(data.metrics).forEach(([metric_name, metric_data]) => {
        const values = metric_data.values;
        const mean = values.reduce((acc, v) => acc + v, 0) / values.length;
        const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / values.length;
        const stddev = Math.sqrt(variance);

        finalResults[variant].metrics[metric_name] = {
          mean,
          stddev,
          count: values.length,
        };
      });
    });

    return finalResults;
  } catch (error) {
    logger.error('Erro ao calcular resultados do experimento:', error);
    return {};
  }
};

// ============= ANÁLISE ESTATÍSTICA =============

/**
 * Calcula significância estatística entre variantes
 * Usa teste t de Student para comparar médias
 */
export const calculateSignificance = async (
  experiment_id: string,
  metric_name: string
): Promise<{
  control_mean: number;
  variant_mean: number;
  improvement_percent: number;
  p_value: number;
  is_significant: boolean;
  confidence_level: number;
}> => {
  try {
    const results = await getExperimentResults(experiment_id);

    const control = results['control'];
    const variant = results['variant'] || results['variant_a'];

    if (!control || !variant) {
      throw new Error('Control ou variant não encontrado');
    }

    const controlMetric = control.metrics[metric_name];
    const variantMetric = variant.metrics[metric_name];

    if (!controlMetric || !variantMetric) {
      throw new Error(`Métrica ${metric_name} não encontrada`);
    }

    const control_mean = controlMetric.mean;
    const variant_mean = variantMetric.mean;
    const improvement_percent = ((variant_mean - control_mean) / control_mean) * 100;

    // Teste t simplificado (para implementação completa, usar biblioteca estatística)
    const pooled_stddev = Math.sqrt((Math.pow(controlMetric.stddev, 2) + Math.pow(variantMetric.stddev, 2)) / 2);

    const t_statistic =
      (variant_mean - control_mean) / (pooled_stddev * Math.sqrt(1 / controlMetric.count + 1 / variantMetric.count));

    // P-value aproximado (simplificado)
    const p_value = approximatePValue(Math.abs(t_statistic));

    const is_significant = p_value < 0.05;
    const confidence_level = (1 - p_value) * 100;

    return {
      control_mean,
      variant_mean,
      improvement_percent,
      p_value,
      is_significant,
      confidence_level,
    };
  } catch (error) {
    logger.error('Erro ao calcular significância:', error);
    return {
      control_mean: 0,
      variant_mean: 0,
      improvement_percent: 0,
      p_value: 1,
      is_significant: false,
      confidence_level: 0,
    };
  }
};

/**
 * Aproximação de p-value (simplificada)
 * Para implementação completa, usar biblioteca estatística
 */
const approximatePValue = (t_statistic: number): number => {
  // Aproximação usando distribuição normal
  if (t_statistic < 1.96) return 0.05;
  if (t_statistic < 2.58) return 0.01;
  if (t_statistic < 3.29) return 0.001;
  return 0.0001;
};

/**
 * Gera relatório completo do experimento
 */
export const generateExperimentReport = async (
  experiment_id: string
): Promise<{
  experiment: Experiment | null;
  results: any;
  significance: any;
  recommendation: string;
}> => {
  try {
    // Buscar experimento
    const { data: experiment, error: expError } = await supabase
      .from('nathia_experiments')
      .select('*')
      .eq('experiment_id', experiment_id)
      .single();

    if (expError || !experiment) {
      throw new Error('Experimento não encontrado');
    }

    // Buscar resultados
    const results = await getExperimentResults(experiment_id);

    // Calcular significância
    const significance = await calculateSignificance(experiment_id, experiment.target_metric);

    // Gerar recomendação
    let recommendation = '';

    if (significance.is_significant) {
      if (significance.improvement_percent > 0) {
        recommendation = `✅ Implementar variante! Melhoria significativa de ${significance.improvement_percent.toFixed(2)}% (confiança: ${significance.confidence_level.toFixed(2)}%)`;
      } else {
        recommendation = `❌ Manter control. Variante tem performance pior (${significance.improvement_percent.toFixed(2)}%)`;
      }
    } else {
      recommendation = `⚠️ Resultados não significativos (p=${significance.p_value.toFixed(3)}). Continuar experimento ou coletar mais dados.`;
    }

    return {
      experiment,
      results,
      significance,
      recommendation,
    };
  } catch (error) {
    logger.error('Erro ao gerar relatório:', error);
    return {
      experiment: null,
      results: {},
      significance: {},
      recommendation: 'Erro ao gerar relatório',
    };
  }
};

// ============= HELPERS =============

/**
 * Hash de user_id para privacidade
 */
const hashUserId = (user_id: string): string => {
  return createHash('sha256').update(user_id).digest('hex');
};

// Export default
export default {
  createExperiment,
  startExperiment,
  pauseExperiment,
  completeExperiment,
  listExperiments,
  assignVariant,
  getUserVariant,
  trackExperimentMetric,
  getExperimentResults,
  calculateSignificance,
  generateExperimentReport,
};

/**
 * Quality Metrics Service
 *
 * Rastreia métricas de qualidade da NAT-IA:
 * - Utilidade (thumbs up/down) - Meta: ≥85%
 * - Deflexão (resolvido sem humano) - Meta: ≥60%
 * - CSAT (Customer Satisfaction) - Meta: ≥4.5
 * - Conversão (ações completadas) - Meta: ≥35%
 *
 * PRIVACIDADE: Todas as métricas são anônimas e não contêm PII
 */

import { supabase } from '../supabase';
import type { UtilityFeedback, DeflectionMetric, AcolhimentoMetric, ConversaoMetric, QualityMetrics } from './types';
import { logger } from '@/utils/logger';

// ============= UTILIDADE (Thumbs Up/Down) =============

/**
 * Registra feedback de utilidade do usuário (thumbs up/down)
 * Meta: ≥85% thumbs up
 */
export const trackUtilidade = async (
  message_id: string,
  session_id: string,
  thumbs: 'up' | 'down',
  feedback_text?: string
): Promise<void> => {
  try {
    const feedback: Partial<UtilityFeedback> = {
      message_id,
      session_id,
      thumbs,
      feedback_text,
      timestamp: new Date(),
    };

    const { error } = await supabase.from('nathia_quality_feedback').insert(feedback);

    if (error) throw error;

    // Atualizar métrica agregada
    await updateQualityMetrics('utilidade');
  } catch (error) {
    logger.error('Erro ao registrar utilidade:', error);
    throw error;
  }
};

/**
 * Calcula percentual de utilidade (thumbs up)
 */
export const getUtilidadePercentual = async (periodo: string = '7d'): Promise<number> => {
  try {
    const dataInicio = getDataInicio(periodo);

    const { data, error } = await supabase
      .from('nathia_quality_feedback')
      .select('thumbs')
      .gte('timestamp', dataInicio.toISOString());

    if (error) throw error;

    if (!data || data.length === 0) return 0;

    const thumbsUp = data.filter((f) => f.thumbs === 'up').length;
    const total = data.length;

    return (thumbsUp / total) * 100;
  } catch (error) {
    logger.error('Erro ao calcular utilidade:', error);
    return 0;
  }
};

// ============= DEFLEXÃO (Resolvido sem humano) =============

/**
 * Registra se a conversa foi resolvida sem transferência humana
 * Meta: ≥60% deflexão
 */
export const trackDeflexao = async (
  session_id: string,
  resolvido_sem_humano: boolean,
  tempo_resolucao_min: number,
  tentativas_transferencia: number = 0
): Promise<void> => {
  try {
    const metric: Partial<DeflectionMetric> = {
      session_id,
      resolvido_sem_humano,
      tempo_resolucao_min,
      tentativas_transferencia,
      timestamp: new Date(),
    };

    const { error } = await supabase.from('nathia_deflection_metrics').insert(metric);

    if (error) throw error;

    // Atualizar métrica agregada
    await updateQualityMetrics('deflexao');
  } catch (error) {
    logger.error('Erro ao registrar deflexão:', error);
    throw error;
  }
};

/**
 * Calcula percentual de deflexão
 */
export const getDeflexaoPercentual = async (periodo: string = '7d'): Promise<number> => {
  try {
    const dataInicio = getDataInicio(periodo);

    const { data, error } = await supabase
      .from('nathia_deflection_metrics')
      .select('resolvido_sem_humano')
      .gte('timestamp', dataInicio.toISOString());

    if (error) throw error;

    if (!data || data.length === 0) return 0;

    const resolvidos = data.filter((d) => d.resolvido_sem_humano).length;
    const total = data.length;

    return (resolvidos / total) * 100;
  } catch (error) {
    logger.error('Erro ao calcular deflexão:', error);
    return 0;
  }
};

// ============= ACOLHIMENTO (CSAT) =============

/**
 * Registra avaliação de acolhimento (CSAT 1-5)
 * Meta: ≥4.5 média
 */
export const trackAcolhimento = async (
  session_id: string,
  csat: 1 | 2 | 3 | 4 | 5,
  nps?: number,
  comentario?: string
): Promise<void> => {
  try {
    const metric: Partial<AcolhimentoMetric> = {
      session_id,
      csat,
      nps,
      comentario,
      timestamp: new Date(),
    };

    const { error } = await supabase.from('nathia_acolhimento_metrics').insert(metric);

    if (error) throw error;

    // Atualizar métrica agregada
    await updateQualityMetrics('csat');
  } catch (error) {
    logger.error('Erro ao registrar acolhimento:', error);
    throw error;
  }
};

/**
 * Calcula CSAT médio
 */
export const getCSATMedio = async (periodo: string = '7d'): Promise<number> => {
  try {
    const dataInicio = getDataInicio(periodo);

    const { data, error } = await supabase
      .from('nathia_acolhimento_metrics')
      .select('csat')
      .gte('timestamp', dataInicio.toISOString());

    if (error) throw error;

    if (!data || data.length === 0) return 0;

    const soma = data.reduce((acc, m) => acc + m.csat, 0);
    return soma / data.length;
  } catch (error) {
    logger.error('Erro ao calcular CSAT:', error);
    return 0;
  }
};

// ============= CONVERSÃO (Ações completadas) =============

/**
 * Registra conversão de ações do usuário
 * Meta: ≥35% conversão
 */
export const trackConversao = async (
  session_id: string,
  action_type: 'marcar_consulta' | 'acessar_recurso' | 'salvar_dica' | 'compartilhar' | 'download_plano',
  completed: boolean,
  abandono_etapa?: string
): Promise<void> => {
  try {
    const metric: Partial<ConversaoMetric> = {
      session_id,
      action_type,
      completed,
      abandono_etapa,
      timestamp: new Date(),
    };

    const { error } = await supabase.from('nathia_conversao_metrics').insert(metric);

    if (error) throw error;

    // Atualizar métrica agregada
    await updateQualityMetrics('conversao');
  } catch (error) {
    logger.error('Erro ao registrar conversão:', error);
    throw error;
  }
};

/**
 * Calcula percentual de conversão
 */
export const getConversaoPercentual = async (periodo: string = '7d'): Promise<number> => {
  try {
    const dataInicio = getDataInicio(periodo);

    const { data, error } = await supabase
      .from('nathia_conversao_metrics')
      .select('completed')
      .gte('timestamp', dataInicio.toISOString());

    if (error) throw error;

    if (!data || data.length === 0) return 0;

    const completados = data.filter((c) => c.completed).length;
    const total = data.length;

    return (completados / total) * 100;
  } catch (error) {
    logger.error('Erro ao calcular conversão:', error);
    return 0;
  }
};

// ============= MÉTRICAS CONSOLIDADAS =============

/**
 * Retorna todas as métricas de qualidade consolidadas
 */
export const getQualityMetrics = async (periodo: string = '7d'): Promise<QualityMetrics> => {
  const [utilidade, deflexao, csat, conversao] = await Promise.all([
    getUtilidadePercentual(periodo),
    getDeflexaoPercentual(periodo),
    getCSATMedio(periodo),
    getConversaoPercentual(periodo),
  ]);

  return {
    utilidade,
    deflexao,
    csat,
    conversao,
  };
};

/**
 * Verifica se as métricas estão dentro das metas
 */
export const checkQualityTargets = async (
  periodo: string = '7d'
): Promise<{
  utilidade: { atual: number; meta: number; atingiu: boolean };
  deflexao: { atual: number; meta: number; atingiu: boolean };
  csat: { atual: number; meta: number; atingiu: boolean };
  conversao: { atual: number; meta: number; atingiu: boolean };
}> => {
  const metrics = await getQualityMetrics(periodo);

  return {
    utilidade: {
      atual: metrics.utilidade,
      meta: 85,
      atingiu: metrics.utilidade >= 85,
    },
    deflexao: {
      atual: metrics.deflexao,
      meta: 60,
      atingiu: metrics.deflexao >= 60,
    },
    csat: {
      atual: metrics.csat,
      meta: 4.5,
      atingiu: metrics.csat >= 4.5,
    },
    conversao: {
      atual: metrics.conversao,
      meta: 35,
      atingiu: metrics.conversao >= 35,
    },
  };
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
      return new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
};

/**
 * Atualiza métricas agregadas diárias
 */
const updateQualityMetrics = async (metrica: string): Promise<void> => {
  try {
    const hoje = new Date().toISOString().split('T')[0];
    const metrics = await getQualityMetrics('24h');

    const { error } = await supabase.from('nathia_metrics').upsert(
      {
        date: hoje,
        quality_metrics: metrics,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'date',
      }
    );

    if (error) throw error;
  } catch (error) {
    logger.error('Erro ao atualizar métricas agregadas:', error);
  }
};

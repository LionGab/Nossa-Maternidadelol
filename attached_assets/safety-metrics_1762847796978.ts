/**
 * Safety Metrics Service
 *
 * Rastreia métricas de segurança da NAT-IA:
 * - Detecção de riscos (baixo, médio, alto, crítico)
 * - Moderação manual
 * - Eventos SOS
 * - Precision/Recall de detecção
 *
 * PRIVACIDADE: Contextos são anonimizados, sem PII
 */

import { supabase } from '../supabase';
import type { RiskDetection, ModerationEvent, SOSEvent, SafetyMetrics } from './types';
import { createHash } from 'crypto';
import { logger } from '@/utils/logger';

// ============= DETECÇÃO DE RISCOS =============

/**
 * Registra detecção de risco
 * Níveis: baixo, médio, alto, crítico
 */
export const trackRiscoDetectado = async (
  session_id: string,
  nivel_risco: 'baixo' | 'medio' | 'alto' | 'critico',
  sinais_detectados: string[],
  acao_tomada: 'alerta' | 'moderacao' | 'encaminhamento_urgente',
  falso_positivo?: boolean
): Promise<void> => {
  try {
    const detection: Partial<RiskDetection> = {
      session_id,
      nivel_risco,
      sinais_detectados,
      falso_positivo,
      acao_tomada,
      timestamp: new Date(),
    };

    const { error } = await supabase.from('nathia_safety_events').insert(detection);

    if (error) throw error;

    // Atualizar métricas de precision/recall
    await updateSafetyMetrics();

    // Alertar se risco crítico
    if (nivel_risco === 'critico') {
      await triggerCriticalRiskAlert(session_id, sinais_detectados);
    }
  } catch (error) {
    logger.error('Erro ao registrar risco:', error);
    throw error;
  }
};

/**
 * Marca detecção como falso positivo (para treinar modelo)
 */
export const marcarFalsoPositivo = async (detection_id: string, falso_positivo: boolean): Promise<void> => {
  try {
    const { error } = await supabase
      .from('nathia_safety_events')
      .update({ falso_positivo, updated_at: new Date().toISOString() })
      .eq('id', detection_id);

    if (error) throw error;

    // Recalcular precision/recall
    await updateSafetyMetrics();
  } catch (error) {
    logger.error('Erro ao marcar falso positivo:', error);
  }
};

/**
 * Calcula métricas de detecção de risco
 */
export const getRiskDetectionMetrics = async (
  periodo: string = '30d'
): Promise<{
  total_detectados: number;
  por_nivel: Record<string, number>;
  falsos_positivos: number;
  taxa_falso_positivo: number;
}> => {
  try {
    const dataInicio = getDataInicio(periodo);

    const { data, error } = await supabase
      .from('nathia_safety_events')
      .select('*')
      .gte('timestamp', dataInicio.toISOString());

    if (error) throw error;

    if (!data || data.length === 0) {
      return {
        total_detectados: 0,
        por_nivel: {},
        falsos_positivos: 0,
        taxa_falso_positivo: 0,
      };
    }

    const total_detectados = data.length;
    const falsos_positivos = data.filter((d) => d.falso_positivo === true).length;
    const taxa_falso_positivo = (falsos_positivos / total_detectados) * 100;

    // Contar por nível
    const por_nivel: Record<string, number> = {};
    data.forEach((d) => {
      por_nivel[d.nivel_risco] = (por_nivel[d.nivel_risco] || 0) + 1;
    });

    return {
      total_detectados,
      por_nivel,
      falsos_positivos,
      taxa_falso_positivo,
    };
  } catch (error) {
    logger.error('Erro ao calcular métricas de risco:', error);
    return {
      total_detectados: 0,
      por_nivel: {},
      falsos_positivos: 0,
      taxa_falso_positivo: 0,
    };
  }
};

// ============= MODERAÇÃO MANUAL =============

/**
 * Registra evento de moderação manual
 */
export const trackModeracaoManual = async (
  message_id: string,
  session_id: string,
  decisao: 'aprovado' | 'bloqueado' | 'escalado',
  moderador_id: string,
  tempo_resposta_min: number,
  notas?: string
): Promise<void> => {
  try {
    const event: Partial<ModerationEvent> = {
      message_id,
      session_id,
      decisao,
      moderador_id,
      tempo_resposta_min,
      notas,
      timestamp: new Date(),
    };

    const { error } = await supabase.from('nathia_moderation_events').insert(event);

    if (error) throw error;
  } catch (error) {
    logger.error('Erro ao registrar moderação:', error);
  }
};

/**
 * Calcula métricas de moderação
 */
export const getModerationMetrics = async (
  periodo: string = '30d'
): Promise<{
  total_moderacoes: number;
  por_decisao: Record<string, number>;
  tempo_medio_resposta_min: number;
  tempo_mediano_resposta_min: number;
}> => {
  try {
    const dataInicio = getDataInicio(periodo);

    const { data, error } = await supabase
      .from('nathia_moderation_events')
      .select('*')
      .gte('timestamp', dataInicio.toISOString());

    if (error) throw error;

    if (!data || data.length === 0) {
      return {
        total_moderacoes: 0,
        por_decisao: {},
        tempo_medio_resposta_min: 0,
        tempo_mediano_resposta_min: 0,
      };
    }

    const total_moderacoes = data.length;

    // Contar por decisão
    const por_decisao: Record<string, number> = {};
    data.forEach((d) => {
      por_decisao[d.decisao] = (por_decisao[d.decisao] || 0) + 1;
    });

    // Calcular tempos
    const tempos = data.map((d) => d.tempo_resposta_min).sort((a, b) => a - b);
    const tempo_medio_resposta_min = tempos.reduce((acc, t) => acc + t, 0) / tempos.length;
    const tempo_mediano_resposta_min = tempos[Math.floor(tempos.length / 2)];

    return {
      total_moderacoes,
      por_decisao,
      tempo_medio_resposta_min,
      tempo_mediano_resposta_min,
    };
  } catch (error) {
    logger.error('Erro ao calcular métricas de moderação:', error);
    return {
      total_moderacoes: 0,
      por_decisao: {},
      tempo_medio_resposta_min: 0,
      tempo_mediano_resposta_min: 0,
    };
  }
};

// ============= EVENTOS SOS =============

/**
 * Registra evento SOS (situação de emergência)
 * PRIVACIDADE: user_id é hasheado, contexto é anonimizado
 */
export const trackSOS = async (
  user_id: string,
  tipo_situacao: string,
  urgencia: 'baixa' | 'media' | 'alta' | 'emergencia',
  fase_maternidade: 'gestante' | 'puerperio' | 'mae_estabelecida',
  recurso_usado: 'telefone_191' | 'samu' | 'cvv' | 'centros_apoio' | 'artigo_info'
): Promise<void> => {
  try {
    // Hash do user_id para privacidade
    const user_id_hash = hashUserId(user_id);

    const event: Partial<SOSEvent> = {
      user_id_hash,
      contexto_anonimizado: {
        tipo_situacao: anonimizarTipo(tipo_situacao),
        urgencia,
        fase_maternidade,
      },
      recurso_usado,
      timestamp: new Date(),
    };

    const { error } = await supabase.from('nathia_sos_events').insert(event);

    if (error) throw error;

    // Alertar equipe em caso de emergência
    if (urgencia === 'emergencia') {
      await triggerSOSAlert(user_id_hash, tipo_situacao);
    }
  } catch (error) {
    logger.error('Erro ao registrar SOS:', error);
  }
};

/**
 * Calcula métricas de eventos SOS
 */
export const getSOSMetrics = async (
  periodo: string = '30d'
): Promise<{
  total_eventos: number;
  por_urgencia: Record<string, number>;
  por_recurso: Record<string, number>;
  por_fase: Record<string, number>;
}> => {
  try {
    const dataInicio = getDataInicio(periodo);

    const { data, error } = await supabase
      .from('nathia_sos_events')
      .select('*')
      .gte('timestamp', dataInicio.toISOString());

    if (error) throw error;

    if (!data || data.length === 0) {
      return {
        total_eventos: 0,
        por_urgencia: {},
        por_recurso: {},
        por_fase: {},
      };
    }

    const total_eventos = data.length;

    // Contar por urgência
    const por_urgencia: Record<string, number> = {};
    data.forEach((d) => {
      const urgencia = d.contexto_anonimizado.urgencia;
      por_urgencia[urgencia] = (por_urgencia[urgencia] || 0) + 1;
    });

    // Contar por recurso usado
    const por_recurso: Record<string, number> = {};
    data.forEach((d) => {
      por_recurso[d.recurso_usado] = (por_recurso[d.recurso_usado] || 0) + 1;
    });

    // Contar por fase
    const por_fase: Record<string, number> = {};
    data.forEach((d) => {
      const fase = d.contexto_anonimizado.fase_maternidade;
      por_fase[fase] = (por_fase[fase] || 0) + 1;
    });

    return {
      total_eventos,
      por_urgencia,
      por_recurso,
      por_fase,
    };
  } catch (error) {
    logger.error('Erro ao calcular métricas SOS:', error);
    return {
      total_eventos: 0,
      por_urgencia: {},
      por_recurso: {},
      por_fase: {},
    };
  }
};

// ============= PRECISION/RECALL =============

/**
 * Calcula Precision e Recall de detecção de risco
 * Precision = TP / (TP + FP)
 * Recall = TP / (TP + FN)
 */
export const getPrecisionRecall = async (
  periodo: string = '30d'
): Promise<{
  precision: number;
  recall: number;
  f1_score: number;
  true_positives: number;
  false_positives: number;
  false_negatives: number;
}> => {
  try {
    const dataInicio = getDataInicio(periodo);

    const { data, error } = await supabase
      .from('nathia_safety_events')
      .select('*')
      .gte('timestamp', dataInicio.toISOString());

    if (error) throw error;

    if (!data || data.length === 0) {
      return {
        precision: 0,
        recall: 0,
        f1_score: 0,
        true_positives: 0,
        false_positives: 0,
        false_negatives: 0,
      };
    }

    // True Positives: detecções corretas (não marcadas como falso positivo)
    const true_positives = data.filter((d) => d.falso_positivo === false).length;

    // False Positives: detecções incorretas (marcadas como falso positivo)
    const false_positives = data.filter((d) => d.falso_positivo === true).length;

    // False Negatives: riscos não detectados (deve ser reportado manualmente)
    // Por enquanto, estimamos baseado em escalações manuais
    const { data: moderacoes } = await supabase
      .from('nathia_moderation_events')
      .select('*')
      .eq('decisao', 'escalado')
      .gte('timestamp', dataInicio.toISOString());

    const false_negatives = moderacoes?.length || 0;

    // Calcular métricas
    const precision = true_positives / (true_positives + false_positives) || 0;
    const recall = true_positives / (true_positives + false_negatives) || 0;
    const f1_score = (2 * precision * recall) / (precision + recall) || 0;

    return {
      precision: precision * 100,
      recall: recall * 100,
      f1_score: f1_score * 100,
      true_positives,
      false_positives,
      false_negatives,
    };
  } catch (error) {
    logger.error('Erro ao calcular precision/recall:', error);
    return {
      precision: 0,
      recall: 0,
      f1_score: 0,
      true_positives: 0,
      false_positives: 0,
      false_negatives: 0,
    };
  }
};

// ============= MÉTRICAS CONSOLIDADAS =============

/**
 * Retorna todas as métricas de segurança consolidadas
 */
export const getSafetyMetrics = async (periodo: string = '30d'): Promise<SafetyMetrics> => {
  const [riskMetrics, moderationMetrics, precisionRecall] = await Promise.all([
    getRiskDetectionMetrics(periodo),
    getModerationMetrics(periodo),
    getPrecisionRecall(periodo),
  ]);

  return {
    riscos_detectados: riskMetrics.total_detectados,
    falsos_positivos: riskMetrics.falsos_positivos,
    falsos_negativos: precisionRecall.false_negatives,
    precision: precisionRecall.precision,
    recall: precisionRecall.recall,
    tempo_moderacao_medio_min: moderationMetrics.tempo_medio_resposta_min,
  };
};

// ============= HELPERS =============

/**
 * Hash de user_id para privacidade
 */
const hashUserId = (user_id: string): string => {
  return createHash('sha256').update(user_id).digest('hex');
};

/**
 * Anonimiza tipo de situação (remove detalhes sensíveis)
 */
const anonimizarTipo = (tipo: string): string => {
  const categorias: Record<string, string> = {
    sangramento: 'saude_fisica',
    dor: 'saude_fisica',
    febre: 'saude_fisica',
    suicida: 'saude_mental',
    depressao: 'saude_mental',
    ansiedade: 'saude_mental',
    violencia: 'violencia',
    abuso: 'violencia',
  };

  const categoria = Object.keys(categorias).find((key) => tipo.toLowerCase().includes(key));

  return categoria ? categorias[categoria] : 'geral';
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
      return new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
};

/**
 * Atualiza métricas agregadas de segurança
 */
const updateSafetyMetrics = async (): Promise<void> => {
  try {
    const hoje = new Date().toISOString().split('T')[0];
    const metrics = await getSafetyMetrics('24h');

    const { error } = await supabase.from('nathia_metrics').upsert(
      {
        date: hoje,
        safety_metrics: metrics,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'date',
      }
    );

    if (error) throw error;
  } catch (error) {
    logger.error('Erro ao atualizar métricas de segurança:', error);
  }
};

/**
 * Dispara alerta de risco crítico
 */
const triggerCriticalRiskAlert = async (session_id: string, sinais: string[]): Promise<void> => {
  try {
    const { default: alerts } = await import('./alerts');
    await alerts.alertIfRiskCritical(session_id, sinais);
  } catch (error) {
    logger.error('Erro ao disparar alerta de risco crítico:', error);
  }
};

/**
 * Dispara alerta de evento SOS
 */
const triggerSOSAlert = async (user_id_hash: string, tipo: string): Promise<void> => {
  try {
    const { default: alerts } = await import('./alerts');
    await alerts.alertIfSOSEvent(user_id_hash, tipo);
  } catch (error) {
    logger.error('Erro ao disparar alerta SOS:', error);
  }
};

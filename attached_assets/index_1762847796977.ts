/**
 * NAT-IA Metrics - Export central
 *
 * Sistema completo de métricas e qualidade para NAT-IA
 *
 * @example
 * ```ts
 * import { qualityMetrics, performanceMetrics } from '@/services/metrics';
 *
 * // Rastrear qualidade
 * await qualityMetrics.trackUtilidade(messageId, sessionId, 'up');
 *
 * // Rastrear performance
 * await performanceMetrics.trackLatencia('nathia-chat', 1500);
 * ```
 */

// ============= TYPES =============
export * from './types';

// ============= QUALITY METRICS =============
export * as qualityMetrics from './quality-metrics';
export {
  trackUtilidade,
  trackDeflexao,
  trackAcolhimento,
  trackConversao,
  getQualityMetrics,
  checkQualityTargets,
} from './quality-metrics';

// ============= PERFORMANCE METRICS =============
export * as performanceMetrics from './performance-metrics';
export {
  trackLatencia,
  trackTokens,
  trackError,
  getPerformanceMetrics,
  getLatencyPercentiles,
  getTokenStats,
  checkLatencySLO,
} from './performance-metrics';

// ============= SAFETY METRICS =============
export * as safetyMetrics from './safety-metrics';
export {
  trackRiscoDetectado,
  trackModeracaoManual,
  trackSOS,
  getSafetyMetrics,
  getRiskDetectionMetrics,
  getPrecisionRecall,
} from './safety-metrics';

// ============= USAGE ANALYTICS =============
export * as usageAnalytics from './usage-analytics';
export {
  trackTema,
  trackSentimento,
  trackTemasMaisFrequentes,
  trackHumorTendencia,
  trackHorariosPico,
  trackFaseUsuarias,
  getUsageAnalytics,
} from './usage-analytics';

// ============= ALERTS =============
export { default as alerts } from './alerts';
export {
  alertIfQualityDrop,
  alertIfLatencySpike,
  alertIfCostSpike,
  alertIfRiskMissed,
  resolveAlert,
  getActiveAlerts,
  runAllMonitors,
} from './alerts';

// ============= A/B TESTING =============
export { default as abTesting } from './ab-testing';
export {
  createExperiment,
  startExperiment,
  assignVariant,
  trackExperimentMetric,
  getExperimentResults,
  calculateSignificance,
  generateExperimentReport,
} from './ab-testing';

// ============= COST TRACKING =============
export { default as costTracker } from './cost-tracker';
export {
  calculateCallCost,
  trackByModel,
  getCostMetrics,
  estimarCustoMensal,
  sugerirOtimizacoes,
  gerarRelatorioCustos,
} from './cost-tracker';

// ============= CONSOLIDATED METRICS =============

/**
 * Retorna todas as métricas consolidadas
 */
export const getAllMetrics = async (periodo: string = '7d') => {
  const { getQualityMetrics } = await import('./quality-metrics');
  const { getPerformanceMetrics } = await import('./performance-metrics');
  const { getSafetyMetrics } = await import('./safety-metrics');
  const { getUsageAnalytics } = await import('./usage-analytics');
  const { getCostMetrics } = await import('./cost-tracker');

  const [quality, performance, safety, usage, cost] = await Promise.all([
    getQualityMetrics(periodo),
    getPerformanceMetrics(periodo),
    getSafetyMetrics(periodo),
    getUsageAnalytics(periodo),
    getCostMetrics(periodo),
  ]);

  return {
    quality,
    performance,
    safety,
    usage,
    cost,
    generated_at: new Date(),
  };
};

/**
 * Retorna métricas resumidas para dashboard
 */
export const getDashboardMetrics = async () => {
  const metrics = await getAllMetrics('7d');

  return {
    // Quality (metas)
    utilidade: {
      valor: metrics.quality.utilidade,
      meta: 85,
      status: metrics.quality.utilidade >= 85 ? 'ok' : 'warning',
    },
    deflexao: {
      valor: metrics.quality.deflexao,
      meta: 60,
      status: metrics.quality.deflexao >= 60 ? 'ok' : 'warning',
    },
    csat: {
      valor: metrics.quality.csat,
      meta: 4.5,
      status: metrics.quality.csat >= 4.5 ? 'ok' : 'warning',
    },
    conversao: {
      valor: metrics.quality.conversao,
      meta: 35,
      status: metrics.quality.conversao >= 35 ? 'ok' : 'warning',
    },

    // Performance (SLOs)
    latencia_p50: {
      valor: metrics.performance.latencia_p50_ms,
      slo: 2500,
      status: metrics.performance.latencia_p50_ms < 2500 ? 'ok' : 'warning',
    },
    latencia_p95: {
      valor: metrics.performance.latencia_p95_ms,
      slo: 5000,
      status: metrics.performance.latencia_p95_ms < 5000 ? 'ok' : 'critical',
    },
    taxa_erro: {
      valor: metrics.performance.taxa_erro_percent,
      slo: 1,
      status: metrics.performance.taxa_erro_percent < 1 ? 'ok' : 'warning',
    },
    disponibilidade: {
      valor: metrics.performance.disponibilidade_percent,
      slo: 99.5,
      status: metrics.performance.disponibilidade_percent >= 99.5 ? 'ok' : 'critical',
    },

    // Safety
    riscos_detectados: metrics.safety.riscos_detectados,
    precision: {
      valor: metrics.safety.precision,
      target: 90,
      status: metrics.safety.precision >= 90 ? 'ok' : 'warning',
    },
    recall: {
      valor: metrics.safety.recall,
      target: 85,
      status: metrics.safety.recall >= 85 ? 'ok' : 'warning',
    },

    // Usage
    usuarios_ativos_diarios: metrics.usage.usuarios_ativos_diarios,
    mensagens_por_sessao: metrics.usage.mensagens_por_sessao_media,
    retencao_d7: {
      valor: metrics.usage.taxa_retencao_d7,
      target: 40,
      status: metrics.usage.taxa_retencao_d7 >= 40 ? 'ok' : 'warning',
    },

    // Cost
    custo_diario: metrics.cost.custo_diario_usd,
    custo_mensal_estimado: metrics.cost.custo_mensal_estimado_usd,
    custo_por_mensagem: metrics.cost.custo_por_mensagem_usd,
  };
};

/**
 * Verifica saúde geral do sistema
 */
export const getSystemHealth = async (): Promise<{
  status: 'healthy' | 'degraded' | 'critical';
  issues: string[];
  score: number;
}> => {
  const dashboard = await getDashboardMetrics();
  const issues: string[] = [];
  let score = 100;

  // Verificar cada métrica
  if (dashboard.utilidade.status !== 'ok') {
    issues.push(`Utilidade baixa: ${dashboard.utilidade.valor.toFixed(2)}% (meta: 85%)`);
    score -= 10;
  }

  if (dashboard.latencia_p95.status === 'critical') {
    issues.push(`Latência P95 crítica: ${dashboard.latencia_p95.valor}ms (SLO: 5000ms)`);
    score -= 20;
  }

  if (dashboard.taxa_erro.status !== 'ok') {
    issues.push(`Taxa de erro alta: ${dashboard.taxa_erro.valor.toFixed(2)}% (SLO: 1%)`);
    score -= 15;
  }

  if (dashboard.disponibilidade.status === 'critical') {
    issues.push(`Disponibilidade baixa: ${dashboard.disponibilidade.valor.toFixed(2)}% (SLO: 99.5%)`);
    score -= 25;
  }

  if (dashboard.precision.status !== 'ok') {
    issues.push(`Precision de detecção baixa: ${dashboard.precision.valor.toFixed(2)}%`);
    score -= 10;
  }

  // Determinar status geral
  let status: 'healthy' | 'degraded' | 'critical' = 'healthy';
  if (score < 70) {
    status = 'critical';
  } else if (score < 90) {
    status = 'degraded';
  }

  return {
    status,
    issues,
    score,
  };
};

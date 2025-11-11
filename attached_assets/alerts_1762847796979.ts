/**
 * Alerts Service
 *
 * Sistema de alertas automatizados para métricas NAT-IA:
 * - Queda de qualidade
 * - Picos de latência
 * - Picos de custo
 * - Riscos perdidos
 * - Taxa de erro alta
 *
 * Notifica via: Slack, Email, SMS (configurável)
 */

import { supabase } from '../supabase';
import type { Alert } from './types';
import { logger } from '@/utils/logger';

// ============= CONFIGURAÇÃO =============

interface AlertConfig {
  enabled: boolean;
  channels: ('slack' | 'email' | 'sms')[];
  slack_webhook_url?: string;
  email_recipients?: string[];
  sms_recipients?: string[];
}

const DEFAULT_CONFIG: AlertConfig = {
  enabled: true,
  channels: ['slack', 'email'],
  slack_webhook_url: process.env.SLACK_WEBHOOK_URL,
  email_recipients: process.env.ALERT_EMAIL_RECIPIENTS?.split(',') || [],
  sms_recipients: process.env.ALERT_SMS_RECIPIENTS?.split(',') || [],
};

// ============= ALERTA DE QUEDA DE QUALIDADE =============

/**
 * Dispara alerta se métrica de qualidade cair abaixo do threshold
 */
export const alertIfQualityDrop = async (
  metrica: 'utilidade' | 'deflexao' | 'csat' | 'conversao',
  valor_atual: number,
  threshold: number
): Promise<void> => {
  if (valor_atual >= threshold) return;

  const alert: Partial<Alert> = {
    tipo: 'quality_drop',
    severidade: 'warning',
    metrica,
    valor_atual,
    threshold,
    mensagem: `ALERTA: ${metrica} caiu para ${valor_atual.toFixed(2)} (threshold: ${threshold})`,
    acionado_em: new Date(),
  };

  await createAlert(alert);
  await sendNotification(alert, DEFAULT_CONFIG);
};

/**
 * Monitora todas as métricas de qualidade
 */
export const monitorQualityMetrics = async (): Promise<void> => {
  try {
    const { getQualityMetrics } = await import('./quality-metrics');
    const metrics = await getQualityMetrics('24h');

    // Verificar cada métrica
    if (metrics.utilidade < 85) {
      await alertIfQualityDrop('utilidade', metrics.utilidade, 85);
    }

    if (metrics.deflexao < 60) {
      await alertIfQualityDrop('deflexao', metrics.deflexao, 60);
    }

    if (metrics.csat < 4.5) {
      await alertIfQualityDrop('csat', metrics.csat, 4.5);
    }

    if (metrics.conversao < 35) {
      await alertIfQualityDrop('conversao', metrics.conversao, 35);
    }
  } catch (error) {
    logger.error('Erro ao monitorar qualidade:', error);
  }
};

// ============= ALERTA DE LATÊNCIA =============

/**
 * Dispara alerta se latência ultrapassar SLO
 */
export const alertIfLatencySpike = async (endpoint: string, latency_ms: number): Promise<void> => {
  const threshold = 5000; // SLO: p95 < 5s

  if (latency_ms < threshold) return;

  const alert: Partial<Alert> = {
    tipo: 'latency_spike',
    severidade: latency_ms > 10000 ? 'critical' : 'warning',
    metrica: `latency_${endpoint}`,
    valor_atual: latency_ms,
    threshold,
    mensagem: `ALERTA: Latência de ${endpoint} atingiu ${latency_ms}ms (SLO: ${threshold}ms)`,
    acionado_em: new Date(),
  };

  await createAlert(alert);

  if (alert.severidade === 'critical') {
    await sendNotification(alert, { ...DEFAULT_CONFIG, channels: ['slack', 'email', 'sms'] });
  } else {
    await sendNotification(alert, DEFAULT_CONFIG);
  }
};

/**
 * Monitora latência de todos os endpoints
 */
export const monitorLatency = async (): Promise<void> => {
  try {
    const { getLatencyPercentiles } = await import('./performance-metrics');
    const { p95 } = await getLatencyPercentiles(undefined, '1h');

    if (p95 > 5000) {
      await alertIfLatencySpike('all_endpoints', p95);
    }
  } catch (error) {
    logger.error('Erro ao monitorar latência:', error);
  }
};

// ============= ALERTA DE CUSTO =============

/**
 * Dispara alerta se custo diário ultrapassar threshold
 */
export const alertIfCostSpike = async (custo_diario_usd: number, threshold: number): Promise<void> => {
  if (custo_diario_usd < threshold) return;

  const alert: Partial<Alert> = {
    tipo: 'cost_spike',
    severidade: 'warning',
    metrica: 'custo_diario',
    valor_atual: custo_diario_usd,
    threshold,
    mensagem: `ALERTA: Custo diário atingiu $${custo_diario_usd.toFixed(2)} (threshold: $${threshold})`,
    acionado_em: new Date(),
  };

  await createAlert(alert);
  await sendNotification(alert, DEFAULT_CONFIG);
};

/**
 * Monitora custos diários
 */
export const monitorCosts = async (threshold: number = 100): Promise<void> => {
  try {
    const { getCostMetrics } = await import('./cost-tracker');
    const { custo_diario_usd } = await getCostMetrics('24h');

    if (custo_diario_usd > threshold) {
      await alertIfCostSpike(custo_diario_usd, threshold);
    }
  } catch (error) {
    logger.error('Erro ao monitorar custos:', error);
  }
};

// ============= ALERTA DE RISCO PERDIDO =============

/**
 * Dispara alerta se falso negativo for detectado
 */
export const alertIfRiskMissed = async (session_id: string, tipo_risco: string): Promise<void> => {
  const alert: Partial<Alert> = {
    tipo: 'risk_missed',
    severidade: 'critical',
    metrica: 'false_negative',
    valor_atual: 1,
    threshold: 0,
    mensagem: `CRÍTICO: Risco não detectado (${tipo_risco}) na sessão ${session_id}`,
    acionado_em: new Date(),
  };

  await createAlert(alert);
  await sendNotification(alert, { ...DEFAULT_CONFIG, channels: ['slack', 'email', 'sms'] });
};

/**
 * Dispara alerta para risco crítico detectado
 */
export const alertIfRiskCritical = async (session_id: string, sinais: string[]): Promise<void> => {
  const alert: Partial<Alert> = {
    tipo: 'risk_missed',
    severidade: 'critical',
    metrica: 'risco_critico',
    valor_atual: 1,
    threshold: 0,
    mensagem: `CRÍTICO: Risco crítico detectado na sessão ${session_id}. Sinais: ${sinais.join(', ')}`,
    acionado_em: new Date(),
  };

  await createAlert(alert);
  await sendNotification(alert, { ...DEFAULT_CONFIG, channels: ['slack', 'email', 'sms'] });
};

// ============= ALERTA DE SOS =============

/**
 * Dispara alerta para evento SOS
 */
export const alertIfSOSEvent = async (user_id_hash: string, tipo: string): Promise<void> => {
  const alert: Partial<Alert> = {
    tipo: 'risk_missed',
    severidade: 'critical',
    metrica: 'sos_event',
    valor_atual: 1,
    threshold: 0,
    mensagem: `EMERGÊNCIA: Evento SOS detectado (${tipo}). User hash: ${user_id_hash.substring(0, 8)}...`,
    acionado_em: new Date(),
  };

  await createAlert(alert);
  await sendNotification(alert, { ...DEFAULT_CONFIG, channels: ['slack', 'email', 'sms'] });
};

// ============= ALERTA DE TAXA DE ERRO =============

/**
 * Dispara alerta se taxa de erro ultrapassar 1%
 */
export const alertIfErrorRateHigh = async (error_rate: number): Promise<void> => {
  const threshold = 1; // 1%

  if (error_rate < threshold) return;

  const alert: Partial<Alert> = {
    tipo: 'error_rate_high',
    severidade: error_rate > 5 ? 'critical' : 'warning',
    metrica: 'error_rate',
    valor_atual: error_rate,
    threshold,
    mensagem: `ALERTA: Taxa de erro atingiu ${error_rate.toFixed(2)}% (SLO: ${threshold}%)`,
    acionado_em: new Date(),
  };

  await createAlert(alert);
  await sendNotification(alert, DEFAULT_CONFIG);
};

/**
 * Monitora taxa de erros
 */
export const monitorErrorRate = async (): Promise<void> => {
  try {
    const { getErrorRate } = await import('./performance-metrics');
    const errorRate = await getErrorRate('1h');

    if (errorRate > 1) {
      await alertIfErrorRateHigh(errorRate);
    }
  } catch (error) {
    logger.error('Erro ao monitorar taxa de erro:', error);
  }
};

// ============= GESTÃO DE ALERTAS =============

/**
 * Cria um alerta no banco de dados
 */
const createAlert = async (alert: Partial<Alert>): Promise<string | null> => {
  try {
    const { data, error } = await supabase.from('nathia_alerts').insert(alert).select().single();

    if (error) throw error;

    return data?.alert_id || null;
  } catch (error) {
    logger.error('Erro ao criar alerta:', error);
    return null;
  }
};

/**
 * Marca alerta como resolvido
 */
export const resolveAlert = async (alert_id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('nathia_alerts')
      .update({ resolvido_em: new Date().toISOString() })
      .eq('alert_id', alert_id);

    if (error) throw error;
  } catch (error) {
    logger.error('Erro ao resolver alerta:', error);
  }
};

/**
 * Lista alertas ativos (não resolvidos)
 */
export const getActiveAlerts = async (): Promise<Alert[]> => {
  try {
    const { data, error } = await supabase
      .from('nathia_alerts')
      .select('*')
      .is('resolvido_em', null)
      .order('acionado_em', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    logger.error('Erro ao buscar alertas ativos:', error);
    return [];
  }
};

// ============= NOTIFICAÇÕES =============

/**
 * Envia notificação pelos canais configurados
 */
const sendNotification = async (alert: Partial<Alert>, config: AlertConfig): Promise<void> => {
  if (!config.enabled) return;

  const promises: Promise<void>[] = [];

  if (config.channels.includes('slack') && config.slack_webhook_url) {
    promises.push(sendSlackNotification(alert, config.slack_webhook_url));
  }

  if (config.channels.includes('email') && config.email_recipients) {
    promises.push(sendEmailNotification(alert, config.email_recipients));
  }

  if (config.channels.includes('sms') && config.sms_recipients) {
    promises.push(sendSMSNotification(alert, config.sms_recipients));
  }

  await Promise.allSettled(promises);

  // Registrar canais notificados
  if (alert.alert_id) {
    await supabase.from('nathia_alerts').update({ notificado_via: config.channels }).eq('alert_id', alert.alert_id);
  }
};

/**
 * Envia notificação via Slack
 */
const sendSlackNotification = async (alert: Partial<Alert>, webhook_url: string): Promise<void> => {
  try {
    const color = alert.severidade === 'critical' ? '#FF0000' : '#FFA500';
    const emoji = alert.severidade === 'critical' ? ':rotating_light:' : ':warning:';

    const payload = {
      text: `${emoji} *NAT-IA Alert*`,
      attachments: [
        {
          color,
          fields: [
            {
              title: 'Tipo',
              value: alert.tipo,
              short: true,
            },
            {
              title: 'Severidade',
              value: alert.severidade,
              short: true,
            },
            {
              title: 'Métrica',
              value: alert.metrica,
              short: true,
            },
            {
              title: 'Valor Atual',
              value: alert.valor_atual?.toString(),
              short: true,
            },
            {
              title: 'Mensagem',
              value: alert.mensagem,
              short: false,
            },
          ],
          footer: 'NAT-IA Metrics',
          ts: Math.floor((alert.acionado_em?.getTime() || Date.now()) / 1000),
        },
      ],
    };

    const response = await fetch(webhook_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Slack notification failed: ${response.statusText}`);
    }
  } catch (error) {
    logger.error('Erro ao enviar notificação Slack:', error);
  }
};

/**
 * Envia notificação via Email (usa Edge Function)
 */
const sendEmailNotification = async (alert: Partial<Alert>, recipients: string[]): Promise<void> => {
  try {
    const { error } = await supabase.functions.invoke('send-alert-email', {
      body: {
        recipients,
        alert,
      },
    });

    if (error) throw error;
  } catch (error) {
    logger.error('Erro ao enviar notificação Email:', error);
  }
};

/**
 * Envia notificação via SMS (usa Edge Function)
 */
const sendSMSNotification = async (alert: Partial<Alert>, recipients: string[]): Promise<void> => {
  try {
    const { error } = await supabase.functions.invoke('send-alert-sms', {
      body: {
        recipients,
        message: alert.mensagem,
      },
    });

    if (error) throw error;
  } catch (error) {
    logger.error('Erro ao enviar notificação SMS:', error);
  }
};

// ============= MONITORAMENTO CONTÍNUO =============

/**
 * Executa todos os monitores (para cron job)
 */
export const runAllMonitors = async (): Promise<void> => {
  logger.info('[Alerts] Executando monitores...');

  await Promise.allSettled([monitorQualityMetrics(), monitorLatency(), monitorCosts(), monitorErrorRate()]);

  logger.info('[Alerts] Monitores concluídos');
};

// Export default
export default {
  alertIfQualityDrop,
  alertIfLatencySpike,
  alertIfCostSpike,
  alertIfRiskMissed,
  alertIfRiskCritical,
  alertIfSOSEvent,
  alertIfErrorRateHigh,
  resolveAlert,
  getActiveAlerts,
  runAllMonitors,
};

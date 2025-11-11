/**
 * Tipos e interfaces para o sistema de métricas NAT-IA
 *
 * PRIVACIDADE: Todas as métricas são anônimas e não contêm PII
 */

// ============= QUALITY METRICS =============

export interface QualityMetrics {
  utilidade: number; // Percentual de thumbs up (meta: ≥85%)
  deflexao: number; // Percentual resolvido sem humano (meta: ≥60%)
  csat: number; // Customer Satisfaction Score 1-5 (meta: ≥4.5)
  conversao: number; // Percentual de ações completadas (meta: ≥35%)
}

export interface UtilityFeedback {
  message_id: string;
  session_id: string;
  thumbs: 'up' | 'down';
  feedback_text?: string;
  timestamp: Date;
}

export interface DeflectionMetric {
  session_id: string;
  resolvido_sem_humano: boolean;
  tempo_resolucao_min: number;
  tentativas_transferencia: number;
  timestamp: Date;
}

export interface AcolhimentoMetric {
  session_id: string;
  csat: 1 | 2 | 3 | 4 | 5;
  nps?: number; // Net Promoter Score 0-10
  comentario?: string;
  timestamp: Date;
}

export interface ConversaoMetric {
  session_id: string;
  action_type: 'marcar_consulta' | 'acessar_recurso' | 'salvar_dica' | 'compartilhar' | 'download_plano';
  completed: boolean;
  abandono_etapa?: string;
  timestamp: Date;
}

// ============= PERFORMANCE METRICS =============

export interface PerformanceMetrics {
  latencia_p50_ms: number; // SLO: < 2500ms
  latencia_p95_ms: number; // SLO: < 5000ms
  latencia_p99_ms: number; // SLO: < 8000ms
  taxa_erro_percent: number; // SLO: < 1%
  disponibilidade_percent: number; // SLO: ≥ 99.5%
}

export interface LatencyMetric {
  endpoint: string;
  latency_ms: number;
  status_code: number;
  timestamp: Date;
}

export interface TokenUsage {
  model: 'gemini-2.0-flash' | 'gemini-1.5-flash' | 'gemini-1.5-pro';
  input_tokens: number;
  output_tokens: number;
  cost_usd: number;
  session_id: string;
  timestamp: Date;
}

export interface ErrorMetric {
  endpoint: string;
  error_type: string;
  error_message: string;
  stack_trace?: string;
  user_id_hash?: string; // Hash do user_id (não PII)
  timestamp: Date;
}

// ============= SAFETY METRICS =============

export interface SafetyMetrics {
  riscos_detectados: number;
  falsos_positivos: number;
  falsos_negativos: number;
  precision: number; // TP / (TP + FP)
  recall: number; // TP / (TP + FN)
  tempo_moderacao_medio_min: number;
}

export interface RiskDetection {
  session_id: string;
  nivel_risco: 'baixo' | 'medio' | 'alto' | 'critico';
  sinais_detectados: string[];
  falso_positivo?: boolean;
  acao_tomada: 'alerta' | 'moderacao' | 'encaminhamento_urgente';
  timestamp: Date;
}

export interface ModerationEvent {
  message_id: string;
  session_id: string;
  decisao: 'aprovado' | 'bloqueado' | 'escalado';
  moderador_id?: string;
  tempo_resposta_min: number;
  notas?: string;
  timestamp: Date;
}

export interface SOSEvent {
  user_id_hash: string; // Hash do user_id (não PII)
  contexto_anonimizado: {
    tipo_situacao: string;
    urgencia: 'baixa' | 'media' | 'alta' | 'emergencia';
    fase_maternidade: 'gestante' | 'puerperio' | 'mae_estabelecida';
  };
  recurso_usado: 'telefone_191' | 'samu' | 'cvv' | 'centros_apoio' | 'artigo_info';
  timestamp: Date;
}

// ============= USAGE ANALYTICS =============

export interface UsageAnalytics {
  sessoes_diarias: number;
  usuarios_ativos_diarios: number;
  mensagens_por_sessao_media: number;
  tempo_sessao_medio_min: number;
  taxa_retencao_d7: number; // % usuários que voltam em 7 dias
  taxa_retencao_d30: number; // % usuários que voltam em 30 dias
}

export interface TemaFrequente {
  tema: string;
  categoria: 'saude' | 'emocional' | 'pratico' | 'informacao' | 'emergencia';
  count: number;
  percentual: number;
  timestamp_agregacao: Date;
}

export interface HumorTendencia {
  periodo: string; // YYYY-MM-DD
  sentimento_medio: number; // -1 (negativo) a 1 (positivo)
  distribuicao: {
    muito_negativo: number;
    negativo: number;
    neutro: number;
    positivo: number;
    muito_positivo: number;
  };
}

export interface HorarioPico {
  hora: number; // 0-23
  dia_semana: number; // 0-6 (Dom-Sáb)
  volume_interacoes: number;
  percentual_total: number;
}

export interface FaseUsuarias {
  fase: 'tentante' | 'gestante' | 'puerperio' | 'mae_estabelecida';
  count: number;
  percentual: number;
  engajamento_medio: number;
}

// ============= A/B TESTING =============

export interface Experiment {
  experiment_id: string;
  name: string;
  description: string;
  variants: string[]; // ['control', 'variant_a', 'variant_b']
  status: 'draft' | 'running' | 'paused' | 'completed';
  start_date: Date;
  end_date?: Date;
  target_metric: string;
  sample_size_per_variant: number;
}

export interface ExperimentAssignment {
  user_id_hash: string;
  experiment_id: string;
  variant: string;
  assigned_at: Date;
}

export interface ExperimentMetric {
  experiment_id: string;
  variant: string;
  metric_name: string;
  metric_value: number;
  sample_size: number;
  timestamp: Date;
}

// ============= ALERTS =============

export interface Alert {
  alert_id: string;
  tipo: 'quality_drop' | 'latency_spike' | 'cost_spike' | 'risk_missed' | 'error_rate_high';
  severidade: 'info' | 'warning' | 'critical';
  metrica: string;
  valor_atual: number;
  threshold: number;
  mensagem: string;
  acionado_em: Date;
  resolvido_em?: Date;
  notificado_via?: ('slack' | 'email' | 'sms')[];
}

// ============= COST TRACKING =============

export interface CostMetrics {
  custo_diario_usd: number;
  custo_mensal_estimado_usd: number;
  custo_por_usuario_usd: number;
  custo_por_mensagem_usd: number;
  breakdown: {
    gemini_api: number;
    supabase: number;
    outros: number;
  };
}

export interface ModelCostConfig {
  model: string;
  input_cost_per_1k: number; // USD
  output_cost_per_1k: number; // USD
  cache_hit_discount?: number; // Percentual de desconto
}

export interface CostOptimization {
  recomendacao: string;
  economia_estimada_usd_mes: number;
  impacto_qualidade: 'nenhum' | 'baixo' | 'medio' | 'alto';
  implementacao: 'facil' | 'media' | 'complexa';
}

// ============= AGGREGATED METRICS =============

export interface DailyMetricsAggregate {
  date: string; // YYYY-MM-DD
  quality: QualityMetrics;
  performance: PerformanceMetrics;
  safety: SafetyMetrics;
  usage: UsageAnalytics;
  cost: CostMetrics;
  created_at: Date;
}

// ============= HELPER TYPES =============

export type MetricsPeriod = '1h' | '24h' | '7d' | '30d' | '90d' | 'all';

export interface MetricsFilter {
  periodo?: MetricsPeriod;
  data_inicio?: Date;
  data_fim?: Date;
  fase_usuaria?: string;
  modelo?: string;
}

export interface MetricsExport {
  formato: 'json' | 'csv' | 'pdf';
  metricas: string[];
  filtros: MetricsFilter;
  destinatario?: string; // email
}

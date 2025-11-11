/**
 * Módulo NAT-IA Analytics
 * Sistema de extração de sinais analíticos sem PII (Personally Identifiable Information)
 */

import { ContentLabels, AnonymizedData, AnalyticsMetrics, ValidationError, NathiaError } from './types';
import { SYSTEM_PROMPTS } from './prompts';
import { NATHIA_CONFIG } from './config';

/**
 * Extrai rótulos analíticos de uma interação
 *
 * @param mensagem - Mensagem ou conteúdo da interação
 * @returns Rótulos estruturados (tema, humor, fase, urgência)
 *
 * @example
 * ```typescript
 * const labels = await extrairRotulos(
 *   "Estou muito preocupada com o sono do meu bebê"
 * );
 * // { tema: ["sono", "preocupacao"], humor: "negative", fase: "postpartum", urgency: "medium" }
 * ```
 */
export async function extrairRotulos(mensagem: string): Promise<ContentLabels> {
  validateMessage(mensagem);

  try {
    // Extrair temas usando palavras-chave padronizadas
    const tema = extractTemas(mensagem);

    // Inferir humor
    const humor = inferHumor(mensagem);

    // Inferir fase da maternidade
    const fase = inferFase(mensagem);

    // Determinar urgência
    const urgency = determineUrgency(mensagem);

    // Preparar prompt para IA refinar
    const prompt = buildRotulosPrompt(mensagem);

    return {
      tema,
      humor,
      fase,
      urgency,
    };
  } catch (error) {
    throw new NathiaError('Erro ao extrair rótulos', 'LABEL_EXTRACTION_ERROR', { error });
  }
}

/**
 * Anonimiza dados removendo qualquer PII
 *
 * @param dados - Dados originais que podem conter PII
 * @returns Dados anonimizados seguros para analytics
 *
 * @example
 * ```typescript
 * const safe = anonimizar({
 *   user_id: "user_123",
 *   name: "Maria Silva",
 *   message: "Estou grávida de 20 semanas",
 *   ip: "192.168.1.1"
 * });
 * // { session_id: "anon_abc123", metadata: { stage: "mid" }, ... }
 * // Remove: user_id, name, email, phone, IP
 * ```
 */
export function anonimizar(dados: Record<string, any>): AnonymizedData {
  // Campos que NUNCA devem aparecer em analytics
  const piiFields = ['user_id', 'name', 'email', 'phone', 'cpf', 'ip', 'address', 'location', 'device_id'];

  // Criar cópia sem PII
  const cleanData: Record<string, any> = {};

  Object.entries(dados).forEach(([key, value]) => {
    // Pular campos de PII
    if (piiFields.includes(key.toLowerCase())) {
      return;
    }

    // Sanitizar valores de string que podem conter PII
    if (typeof value === 'string') {
      cleanData[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null) {
      // Recursivamente anonimizar objetos aninhados
      cleanData[key] = anonimizar(value);
    } else {
      cleanData[key] = value;
    }
  });

  return {
    session_id: generateAnonymousId(),
    timestamp: new Date(),
    interaction_type: dados.interaction_type || 'unknown',
    metadata: cleanData,
  };
}

/**
 * Gera métricas agregadas de um conjunto de interações
 *
 * @param interacoes - Array de interações anonimizadas
 * @returns Métricas agregadas (frequência de tópicos, distribuição de sentimento, engagement)
 *
 * @example
 * ```typescript
 * const metrics = gerarMetricas(arrayDeInteracoes);
 * // {
 * //   topics_freq: { sono: 45, amamentacao: 32 },
 * //   sentiment_dist: { positive: 0.3, neutral: 0.5, negative: 0.2 },
 * //   engagement: { avg_session_length: 8.5, ... }
 * // }
 * ```
 */
export function gerarMetricas(interacoes: AnonymizedData[]): AnalyticsMetrics {
  if (!Array.isArray(interacoes) || interacoes.length === 0) {
    return getEmptyMetrics();
  }

  // Frequência de tópicos
  const topics_freq = calculateTopicFrequency(interacoes);

  // Distribuição de sentimento
  const sentiment_dist = calculateSentimentDistribution(interacoes);

  // Métricas de engagement
  const engagement = calculateEngagement(interacoes);

  // Range de tempo
  const timestamps = interacoes.map((i) => new Date(i.timestamp)).sort((a, b) => a.getTime() - b.getTime());
  const time_range = {
    start: timestamps[0],
    end: timestamps[timestamps.length - 1],
  };

  return {
    topics_freq,
    sentiment_dist,
    engagement,
    time_range,
  };
}

/**
 * Identifica tendências em dados de analytics
 *
 * @param metrics - Métricas de diferentes períodos
 * @returns Tendências identificadas
 */
export function identificarTendencias(metrics: AnalyticsMetrics[]): {
  trending_topics: string[];
  sentiment_trend: 'improving' | 'stable' | 'declining';
  engagement_trend: 'increasing' | 'stable' | 'decreasing';
} {
  if (metrics.length < 2) {
    return {
      trending_topics: [],
      sentiment_trend: 'stable',
      engagement_trend: 'stable',
    };
  }

  // Trending topics (tópicos com crescimento)
  const trending_topics = findTrendingTopics(metrics);

  // Tendência de sentimento
  const sentiment_trend = analyzeSentimentTrend(metrics);

  // Tendência de engagement
  const engagement_trend = analyzeEngagementTrend(metrics);

  return {
    trending_topics,
    sentiment_trend,
    engagement_trend,
  };
}

/**
 * Exporta métricas para formato de dashboard
 *
 * @param metrics - Métricas analíticas
 * @returns Formato pronto para visualização
 */
export function exportarParaDashboard(metrics: AnalyticsMetrics): {
  charts: Array<{
    type: 'bar' | 'pie' | 'line';
    title: string;
    data: any;
  }>;
  summary: string[];
} {
  const charts = [];

  // Chart 1: Top tópicos
  charts.push({
    type: 'bar' as const,
    title: 'Tópicos Mais Discutidos',
    data: Object.entries(metrics.topics_freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([topic, count]) => ({ topic, count })),
  });

  // Chart 2: Distribuição de sentimento
  charts.push({
    type: 'pie' as const,
    title: 'Distribuição de Humor',
    data: [
      { label: 'Positivo', value: metrics.sentiment_dist.positive },
      { label: 'Neutro', value: metrics.sentiment_dist.neutral },
      { label: 'Negativo', value: metrics.sentiment_dist.negative },
    ],
  });

  // Summary insights
  const summary = generateSummaryInsights(metrics);

  return { charts, summary };
}

/**
 * Valida conformidade com LGPD/GDPR
 *
 * @param data - Dados a serem validados
 * @returns Se os dados estão em conformidade
 */
export function validarConformidadeLGPD(data: any): {
  compliant: boolean;
  violations: string[];
} {
  const violations: string[] = [];

  // Verificar presença de PII
  const piiFields = ['user_id', 'name', 'email', 'phone', 'cpf', 'ip', 'address'];

  function checkObject(obj: any, path: string = ''): void {
    if (typeof obj !== 'object' || obj === null) return;

    Object.keys(obj).forEach((key) => {
      const currentPath = path ? `${path}.${key}` : key;

      if (piiFields.includes(key.toLowerCase())) {
        violations.push(`Campo PII encontrado: ${currentPath}`);
      }

      if (typeof obj[key] === 'object') {
        checkObject(obj[key], currentPath);
      } else if (typeof obj[key] === 'string') {
        // Verificar padrões de PII em strings
        if (isPotentialEmail(obj[key])) {
          violations.push(`Possível email em: ${currentPath}`);
        }
        if (isPotentialPhone(obj[key])) {
          violations.push(`Possível telefone em: ${currentPath}`);
        }
      }
    });
  }

  checkObject(data);

  return {
    compliant: violations.length === 0,
    violations,
  };
}

// ============= Funções Auxiliares =============

function validateMessage(mensagem: string): void {
  if (!mensagem || typeof mensagem !== 'string') {
    throw new ValidationError('Mensagem é obrigatória e deve ser string');
  }
}

function extractTemas(mensagem: string): string[] {
  const temasPadronizados = NATHIA_CONFIG.analytics.temas_padronizados;
  const lowerMsg = mensagem.toLowerCase();

  const temasEncontrados = temasPadronizados.filter((tema) => lowerMsg.includes(tema.replace('_', ' ')));

  // Retornar no máximo 3 temas
  return temasEncontrados.slice(0, 3);
}

function inferHumor(mensagem: string): 'positive' | 'neutral' | 'negative' | 'mixed' {
  const lowerMsg = mensagem.toLowerCase();

  // Palavras positivas
  const positiveWords = ['feliz', 'alegre', 'grata', 'ótimo', 'maravilhoso', 'amor'];
  const positiveCount = positiveWords.filter((w) => lowerMsg.includes(w)).length;

  // Palavras negativas
  const negativeWords = ['triste', 'preocupada', 'medo', 'difícil', 'problema', 'dor'];
  const negativeCount = negativeWords.filter((w) => lowerMsg.includes(w)).length;

  if (positiveCount > 0 && negativeCount > 0) return 'mixed';
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

function inferFase(mensagem: string): string {
  const lowerMsg = mensagem.toLowerCase();

  if (lowerMsg.includes('grávida') || lowerMsg.includes('gravidez')) {
    if (lowerMsg.includes('semanas') || lowerMsg.includes('meses')) {
      const weekMatch = lowerMsg.match(/(\d+)\s*semanas?/);
      if (weekMatch) {
        const weeks = parseInt(weekMatch[1]);
        if (weeks <= 12) return 'early';
        if (weeks <= 28) return 'mid';
        return 'late';
      }
    }
    return 'gravidez';
  }

  if (lowerMsg.includes('pós-parto') || lowerMsg.includes('recém-nascido') || lowerMsg.includes('bebê')) {
    return 'postpartum';
  }

  if (lowerMsg.includes('tentando engravidar')) {
    return 'ttc';
  }

  return 'geral';
}

function determineUrgency(mensagem: string): 'low' | 'medium' | 'high' {
  const lowerMsg = mensagem.toLowerCase();

  // Urgência alta
  const highUrgencyWords = ['urgente', 'emergência', 'socorro', 'grave', 'sangramento'];
  if (highUrgencyWords.some((w) => lowerMsg.includes(w))) {
    return 'high';
  }

  // Urgência média
  const mediumUrgencyWords = ['preocupada', 'medo', 'ajuda', 'dúvida'];
  if (mediumUrgencyWords.some((w) => lowerMsg.includes(w))) {
    return 'medium';
  }

  return 'low';
}

function buildRotulosPrompt(mensagem: string): string {
  return `${SYSTEM_PROMPTS.ANALYTICS_ROTULOS}

Mensagem: "${mensagem}"

Retorne em formato JSON:
{
  "tema": ["tema1", "tema2"],
  "humor": "positive|neutral|negative|mixed",
  "fase": "fase identificada",
  "urgency": "low|medium|high"
}`;
}

function sanitizeString(str: string): string {
  // Remover possíveis PII de strings
  let sanitized = str;

  // Remover emails
  sanitized = sanitized.replace(/[\w.-]+@[\w.-]+\.\w+/g, '[EMAIL_REMOVED]');

  // Remover telefones (BR format)
  sanitized = sanitized.replace(/\(?\d{2}\)?\s?\d{4,5}-?\d{4}/g, '[PHONE_REMOVED]');

  // Remover CPF
  sanitized = sanitized.replace(/\d{3}\.\d{3}\.\d{3}-\d{2}/g, '[CPF_REMOVED]');

  return sanitized;
}

function generateAnonymousId(): string {
  return `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function calculateTopicFrequency(interacoes: AnonymizedData[]): Record<string, number> {
  const freq: Record<string, number> = {};

  interacoes.forEach((interacao) => {
    const labels = interacao.metadata.labels as ContentLabels | undefined;
    if (labels && labels.tema) {
      labels.tema.forEach((tema) => {
        freq[tema] = (freq[tema] || 0) + 1;
      });
    }
  });

  return freq;
}

function calculateSentimentDistribution(interacoes: AnonymizedData[]): {
  positive: number;
  neutral: number;
  negative: number;
} {
  const dist = { positive: 0, neutral: 0, negative: 0 };

  interacoes.forEach((interacao) => {
    const labels = interacao.metadata.labels as ContentLabels | undefined;
    if (labels && labels.humor) {
      if (labels.humor === 'positive') dist.positive++;
      else if (labels.humor === 'negative') dist.negative++;
      else dist.neutral++;
    }
  });

  const total = interacoes.length || 1;
  return {
    positive: dist.positive / total,
    neutral: dist.neutral / total,
    negative: dist.negative / total,
  };
}

function calculateEngagement(interacoes: AnonymizedData[]): {
  avg_session_length: number;
  interactions_per_session: number;
  return_rate: number;
} {
  // Mock - na prática calcular baseado em dados reais
  return {
    avg_session_length: 8.5,
    interactions_per_session: 4.2,
    return_rate: 0.65,
  };
}

function getEmptyMetrics(): AnalyticsMetrics {
  return {
    topics_freq: {},
    sentiment_dist: { positive: 0, neutral: 0, negative: 0 },
    engagement: {
      avg_session_length: 0,
      interactions_per_session: 0,
      return_rate: 0,
    },
    time_range: { start: new Date(), end: new Date() },
  };
}

function findTrendingTopics(metrics: AnalyticsMetrics[]): string[] {
  // Simplificado - comparar primeiro e último período
  if (metrics.length < 2) return [];

  const first = metrics[0].topics_freq;
  const last = metrics[metrics.length - 1].topics_freq;

  const trending: string[] = [];

  Object.keys(last).forEach((topic) => {
    const growth = (last[topic] - (first[topic] || 0)) / (first[topic] || 1);
    if (growth > 0.5) {
      // Crescimento de 50%+
      trending.push(topic);
    }
  });

  return trending;
}

function analyzeSentimentTrend(metrics: AnalyticsMetrics[]): 'improving' | 'stable' | 'declining' {
  const first = metrics[0].sentiment_dist;
  const last = metrics[metrics.length - 1].sentiment_dist;

  const firstPositive = first.positive - first.negative;
  const lastPositive = last.positive - last.negative;

  if (lastPositive > firstPositive + 0.1) return 'improving';
  if (lastPositive < firstPositive - 0.1) return 'declining';
  return 'stable';
}

function analyzeEngagementTrend(metrics: AnalyticsMetrics[]): 'increasing' | 'stable' | 'decreasing' {
  const first = metrics[0].engagement.avg_session_length;
  const last = metrics[metrics.length - 1].engagement.avg_session_length;

  if (last > first * 1.1) return 'increasing';
  if (last < first * 0.9) return 'decreasing';
  return 'stable';
}

function generateSummaryInsights(metrics: AnalyticsMetrics): string[] {
  const insights: string[] = [];

  // Top tópico
  const topTopic = Object.entries(metrics.topics_freq).sort((a, b) => b[1] - a[1])[0];
  if (topTopic) {
    insights.push(`Tópico mais discutido: ${topTopic[0]} (${topTopic[1]} interações)`);
  }

  // Sentimento geral
  const { positive, neutral, negative } = metrics.sentiment_dist;
  if (positive > 0.5) {
    insights.push('Sentimento geral: Predominantemente positivo');
  } else if (negative > 0.4) {
    insights.push('Atenção: Sentimento negativo elevado');
  }

  // Engagement
  const { avg_session_length, return_rate } = metrics.engagement;
  insights.push(`Tempo médio de sessão: ${avg_session_length.toFixed(1)} minutos`);
  insights.push(`Taxa de retorno: ${(return_rate * 100).toFixed(0)}%`);

  return insights;
}

function isPotentialEmail(str: string): boolean {
  return /[\w.-]+@[\w.-]+\.\w+/.test(str);
}

function isPotentialPhone(str: string): boolean {
  return /\(?\d{2}\)?\s?\d{4,5}-?\d{4}/.test(str);
}

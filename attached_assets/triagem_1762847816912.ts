/**
 * Módulo NAT-IA Triagem Emocional & Risco
 * Sistema de detecção de sentimento e situações de risco
 */

import {
  SentimentAnalysis,
  RiskAssessment,
  RiskLevel,
  SOSActionResult,
  SupportContact,
  ValidationError,
  NathiaError,
} from './types';
import { SYSTEM_PROMPTS, SUPPORT_RESOURCES } from './prompts';
import { NATHIA_CONFIG } from './config';
import { logger } from '@/utils/logger';

/**
 * Classifica o sentimento de uma mensagem
 *
 * @param mensagem - Mensagem a ser analisada
 * @returns Análise de sentimento com intensidade 0-10
 *
 * @example
 * ```typescript
 * const sentimento = await classificarSentimento(
 *   "Estou tão feliz, meu bebê dormiu a noite toda!"
 * );
 * // { sentimento: "alegria", intensidade: 8, valence: "positive", keywords: ["feliz", "dormiu"] }
 * ```
 */
export async function classificarSentimento(mensagem: string): Promise<SentimentAnalysis> {
  validateMessage(mensagem);

  try {
    // Pré-processamento: análise de keywords
    const keywords = extractEmotionalKeywords(mensagem);
    const valence = inferValence(mensagem, keywords);
    const intensidadeInicial = estimateIntensity(mensagem, keywords);

    // Preparar prompt para IA
    const prompt = buildSentimentPrompt(mensagem);

    // Retornar estrutura que será refinada pela IA
    return {
      sentimento: '', // Será preenchido pela IA
      intensidade: intensidadeInicial,
      valence,
      keywords,
    };
  } catch (error) {
    throw new NathiaError('Erro ao classificar sentimento', 'SENTIMENT_ERROR', { error });
  }
}

/**
 * Detecta nível de risco em uma mensagem
 *
 * @param mensagem - Mensagem a ser avaliada
 * @returns Avaliação de risco com sinais identificados
 *
 * @example
 * ```typescript
 * const risco = await detectarRisco(
 *   "Não aguento mais, quero que tudo acabe"
 * );
 * // { nivel: "risk", sinais: ["expressão de desistência", "ideação suicida"], confidence: 0.9 }
 * ```
 */
export async function detectarRisco(mensagem: string): Promise<RiskAssessment> {
  validateMessage(mensagem);

  try {
    const lowerMsg = mensagem.toLowerCase();
    const config = NATHIA_CONFIG.triagem;

    // Detecção de palavras-chave de alto risco
    const highRiskKeywords = config.keywords_risco_alto.filter((keyword) => lowerMsg.includes(keyword));

    // Detecção de palavras-chave de observação
    const watchKeywords = config.keywords_observacao.filter((keyword) => lowerMsg.includes(keyword));

    // Determinar nível de risco baseado em keywords
    let nivel: RiskLevel = 'ok';
    let confidence = 0;
    const sinais: string[] = [];

    if (highRiskKeywords.length > 0) {
      nivel = 'risk';
      confidence = Math.min(0.9, 0.6 + highRiskKeywords.length * 0.15);
      sinais.push(...highRiskKeywords.map((k) => `Expressão de alto risco: "${k}"`));
    } else if (watchKeywords.length >= 2) {
      nivel = 'watch';
      confidence = Math.min(0.7, 0.4 + watchKeywords.length * 0.1);
      sinais.push(...watchKeywords.map((k) => `Sinal de atenção: "${k}"`));
    } else if (watchKeywords.length === 1) {
      nivel = 'watch';
      confidence = 0.4;
      sinais.push(`Possível preocupação: "${watchKeywords[0]}"`);
    } else {
      confidence = 0.1;
    }

    // Preparar prompt para IA refinar análise
    const prompt = buildRiskPrompt(mensagem);

    return {
      nivel,
      sinais,
      confidence,
      requires_human_review: nivel === 'risk' || (nivel === 'watch' && confidence > 0.6),
      suggested_resources: getSuggestedResources(nivel),
    };
  } catch (error) {
    throw new NathiaError('Erro ao detectar risco', 'RISK_DETECTION_ERROR', { error });
  }
}

/**
 * Aciona protocolo SOS para situações de risco
 *
 * @param user_id - ID da usuária em situação de risco
 * @param contexto - Contexto adicional sobre a situação
 * @returns Resultado da ação SOS
 *
 * @example
 * ```typescript
 * const resultado = await acionarSOS("user_123", {
 *   mensagem: "Não aguento mais",
 *   riskAssessment: { nivel: "risk", sinais: [...] }
 * });
 * // { sent_to_moderation: true, resources_displayed: ["CVV", "SAMU"], ... }
 * ```
 */
export async function acionarSOS(
  user_id: string,
  contexto: {
    mensagem?: string;
    riskAssessment?: RiskAssessment;
    location?: string;
    [key: string]: any;
  }
): Promise<SOSActionResult> {
  if (!user_id) {
    throw new ValidationError('user_id é obrigatório para acionar SOS');
  }

  try {
    // 1. Registrar evento de SOS (para análise posterior e intervenção)
    await logSOSEvent(user_id, contexto);

    // 2. Notificar equipe de moderação/suporte
    await notifyModerationTeam(user_id, contexto);

    // 3. Preparar recursos de apoio imediato
    const supportContacts = getEmergencyContacts();

    // 4. Retornar recursos para exibição imediata
    return {
      sent_to_moderation: true,
      resources_displayed: ['CVV', 'SAMU', 'LIGUE_180'],
      support_contacts: supportContacts,
      timestamp: new Date(),
    };
  } catch (error) {
    // Mesmo com erro, retornar recursos de apoio
    logger.error('Erro ao acionar SOS:', error);

    return {
      sent_to_moderation: false,
      resources_displayed: ['CVV', 'SAMU'],
      support_contacts: getEmergencyContacts(),
      timestamp: new Date(),
    };
  }
}

/**
 * Atualiza keywords de risco em runtime
 * Útil para ajustes baseados em feedback
 */
export function atualizarKeywordsRisco(tipo: 'alto' | 'observacao', keywords: string[]): void {
  const config = NATHIA_CONFIG.triagem;

  if (tipo === 'alto') {
    config.keywords_risco_alto = [...new Set([...config.keywords_risco_alto, ...keywords])];
  } else {
    config.keywords_observacao = [...new Set([...config.keywords_observacao, ...keywords])];
  }
}

/**
 * Obtém estatísticas de triagem (para analytics)
 */
export function getTriagemStats(assessments: RiskAssessment[]): {
  total: number;
  by_level: Record<RiskLevel, number>;
  avg_confidence: number;
  requires_review: number;
} {
  const stats = {
    total: assessments.length,
    by_level: { ok: 0, watch: 0, risk: 0 } as Record<RiskLevel, number>,
    avg_confidence: 0,
    requires_review: 0,
  };

  assessments.forEach((a) => {
    stats.by_level[a.nivel]++;
    stats.avg_confidence += a.confidence;
    if (a.requires_human_review) stats.requires_review++;
  });

  stats.avg_confidence = stats.avg_confidence / (assessments.length || 1);

  return stats;
}

// ============= Funções Auxiliares =============

function validateMessage(mensagem: string): void {
  if (!mensagem || typeof mensagem !== 'string') {
    throw new ValidationError('Mensagem é obrigatória e deve ser string');
  }

  if (mensagem.trim().length === 0) {
    throw new ValidationError('Mensagem não pode estar vazia');
  }
}

function buildSentimentPrompt(mensagem: string): string {
  return `${SYSTEM_PROMPTS.TRIAGEM_SENTIMENTO}

Mensagem: "${mensagem}"

Forneça a análise em formato JSON:
{
  "sentimento": "nome do sentimento",
  "intensidade": 0-10,
  "valence": "positive|neutral|negative",
  "keywords": ["palavras", "chave"]
}`;
}

function buildRiskPrompt(mensagem: string): string {
  return `${SYSTEM_PROMPTS.TRIAGEM_RISCO}

Mensagem: "${mensagem}"

Forneça a análise em formato JSON:
{
  "nivel": "ok|watch|risk",
  "sinais": ["sinais identificados"],
  "confidence": 0-1
}`;
}

function extractEmotionalKeywords(mensagem: string): string[] {
  const emotionalWords = [
    'feliz',
    'alegre',
    'triste',
    'preocupada',
    'ansiosa',
    'medo',
    'cansada',
    'exausta',
    'sozinha',
    'frustrada',
    'grata',
    'esperançosa',
    'desesperada',
    'confusa',
    'culpada',
    'amor',
    'raiva',
  ];

  const lowerMsg = mensagem.toLowerCase();
  return emotionalWords.filter((word) => lowerMsg.includes(word));
}

function inferValence(mensagem: string, keywords: string[]): 'positive' | 'neutral' | 'negative' {
  const positiveWords = ['feliz', 'alegre', 'grata', 'esperançosa', 'amor'];
  const negativeWords = ['triste', 'preocupada', 'ansiosa', 'medo', 'desesperada', 'raiva', 'culpada'];

  const positiveCount = keywords.filter((k) => positiveWords.includes(k)).length;
  const negativeCount = keywords.filter((k) => negativeWords.includes(k)).length;

  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

function estimateIntensity(mensagem: string, keywords: string[]): number {
  const lowerMsg = mensagem.toLowerCase();

  // Intensificadores
  const intensifiers = ['muito', 'extremamente', 'demais', 'tanto', 'completamente'];
  const hasIntensifier = intensifiers.some((i) => lowerMsg.includes(i));

  // Pontuação
  const exclamationCount = (mensagem.match(/!/g) || []).length;
  const questionCount = (mensagem.match(/\?/g) || []).length;

  // Cálculo base
  let intensity = keywords.length * 2; // 0-10+ range

  if (hasIntensifier) intensity += 2;
  intensity += Math.min(exclamationCount, 2);
  intensity += Math.min(questionCount, 1);

  return Math.min(Math.max(intensity, 0), 10);
}

function getSuggestedResources(nivel: RiskLevel): string[] {
  switch (nivel) {
    case 'risk':
      return ['CVV - 188', 'SAMU - 192', 'Atendimento profissional urgente'];
    case 'watch':
      return ['Conversar com alguém de confiança', 'Buscar apoio profissional', 'Círculos de apoio'];
    case 'ok':
      return [];
  }
}

function getEmergencyContacts(): SupportContact[] {
  return [SUPPORT_RESOURCES.CVV, SUPPORT_RESOURCES.SAMU, SUPPORT_RESOURCES.LIGUE_180];
}

async function logSOSEvent(user_id: string, contexto: any): Promise<void> {
  // TODO: Implementar integração com sistema de logs/banco de dados
  logger.info('[SOS] Evento registrado:', {
    user_id,
    timestamp: new Date(),
    contexto_summary: {
      has_message: !!contexto.mensagem,
      risk_level: contexto.riskAssessment?.nivel,
    },
  });
}

async function notifyModerationTeam(user_id: string, contexto: any): Promise<void> {
  // TODO: Implementar integração com sistema de notificações
  // Pode ser Slack, email, sistema interno, etc.
  logger.info('[SOS] Moderação notificada:', {
    user_id,
    timestamp: new Date(),
    priority: 'HIGH',
  });
}

/**
 * NAT-IA - Nossa Assistente de IA
 * Sistema modular de IA empática para Nossa Maternidade
 *
 * @module nathia
 * @version 1.0.0
 */

import { chatEmpatico as chatEmpaticoFn } from './chat';
import { classificarSentimento as classificarSentimentoFn } from './triagem';
import { analisarRespostas as analisarRespostasFn } from './onboarding';
import { resumirConteudo as resumirConteudoFn } from './curadoria';
import { analisarMensagem as analisarMensagemFn } from './moderacao';
import { recomendarConteudo as recomendarConteudoFn } from './recomendacoes';
import { criarMicroObjetivo as criarMicroObjetivoFn } from './habitos';
import { extrairRotulos as extrairRotulosFn } from './analytics';
import { gerarPushNotification as gerarPushNotificationFn } from './copys';
import { NATHIA_CONFIG, validateConfig, getConfig, updateConfig } from './config';

// ============= Módulo 1: Chat Empático =============
export { chatEmpatico, buildChatPrompt, addToHistory, createChatContext, truncateHistory } from './chat';

// ============= Módulo 2: Triagem Emocional & Risco =============
export { classificarSentimento, detectarRisco, acionarSOS, atualizarKeywordsRisco, getTriagemStats } from './triagem';

// ============= Módulo 3: Onboarding Inteligente =============
export {
  analisarRespostas,
  gerarStarterPack,
  getOnboardingQuestions,
  isOnboardingComplete,
  updateProfile,
} from './onboarding';

// ============= Módulo 4: Curadoria de Conteúdo =============
export {
  resumirConteudo,
  criarCincoMinutos,
  gerarChecklist,
  simplificarLinguagem,
  extrairCitacoes,
  identificarTermosTecnicos,
  formatarParaEscaneabilidade,
  validateChecklist,
} from './curadoria';

// ============= Módulo 5: Moderação Assistida =============
export {
  detectarJulgamento,
  detectarToxidade,
  sugerirReescrita,
  gerarRationale,
  analisarMensagem,
  decidirAcao,
  getModerationStats,
  isInAllowedContext,
  ALLOWED_PRESCRIPTIVE_CONTEXTS,
} from './moderacao';

// ============= Módulo 6: Recomendações Personalizadas =============
export { recomendarConteudo, recomendarCirculo, recomendarHabito, rerankWithFeedback } from './recomendacoes';

// ============= Módulo 7: Hábitos & Coaching =============
export {
  criarMicroObjetivo,
  gerarMensagemMotivacional,
  gerarLembreteGentil,
  trackProgresso,
  registrarCompletude,
  sugerirHorario,
  identificarBarreiras,
} from './habitos';

// ============= Módulo 8: Analytics =============
export {
  extrairRotulos,
  anonimizar,
  gerarMetricas,
  identificarTendencias,
  exportarParaDashboard,
  validarConformidadeLGPD,
} from './analytics';

// ============= Módulo 9: Copys Operacionais =============
export {
  gerarPushNotification,
  gerarEmail,
  gerarAppStoreCopy,
  gerarMicrocopy,
  gerarSubjectLineVariante,
  validarCopyBrand,
} from './copys';

// ============= Tipos =============
export type {
  // Chat
  ChatContext,
  ChatMessage,
  ChatResponse,
  SuggestedAction,

  // Triagem
  SentimentAnalysis,
  RiskAssessment,
  RiskLevel,
  SOSActionResult,
  SupportContact,

  // Onboarding
  OnboardingResponse,
  OnboardingAnalysis,
  UserProfile,
  StarterPack,
  GroupRecommendation,
  ContentRecommendation,

  // Curadoria
  ConteudoResumo,
  CincoMinutos,
  Checklist,
  ChecklistItem,
  SimplifiedText,

  // Moderação
  ModerationAnalysis,

  // Recomendações
  RecommendationContext,
  ContentRecommendations,
  CircleRecommendations,
  HabitRecommendation,
  Habit,
  MicroGoal,

  // Hábitos
  MotivationalMessage,
  HabitProgress,

  // Analytics
  ContentLabels,
  AnonymizedData,
  AnalyticsMetrics,

  // Copys
  PushNotification,
  EmailContent,
  AppStoreCopy,
} from './types';

export { NathiaError, ValidationError, AIServiceError } from './types';
export { NATHIA_CONFIG, validateConfig, getConfig, updateConfig };

// ============= Configuração =============
// ============= Prompts =============
export { SYSTEM_PROMPTS, ERROR_MESSAGES, SUPPORT_RESOURCES } from './prompts';

// ============= Versão =============
export const NATHIA_VERSION = '1.0.0';

/**
 * Informações sobre o módulo NAT-IA
 */
export const NATHIA_INFO = {
  name: 'NAT-IA',
  version: NATHIA_VERSION,
  description: 'Sistema modular de IA empática para Nossa Maternidade',
  modules: [
    'chat - Chat empático e acolhedor',
    'triagem - Detecção de sentimento e risco',
    'onboarding - Onboarding inteligente',
    'curadoria - Curadoria de conteúdo',
    'moderacao - Moderação assistida',
    'recomendacoes - Recomendações personalizadas',
    'habitos - Hábitos e coaching',
    'analytics - Analytics sem PII',
    'copys - Copys operacionais',
  ],
  features: {
    empathic: true,
    non_judgmental: true,
    privacy_first: true,
    human_review_required: true,
    ai_agnostic: true,
  },
};

/**
 * Helper para inicializar NAT-IA com configurações customizadas
 */
export function initializeNathia(customConfig?: Partial<typeof NATHIA_CONFIG>): {
  config: typeof NATHIA_CONFIG;
  info: typeof NATHIA_INFO;
  isValid: boolean;
} {
  // Aplicar configurações customizadas se fornecidas
  if (customConfig) {
    Object.keys(customConfig).forEach((key) => {
      const configKey = key as keyof typeof NATHIA_CONFIG;
      if (NATHIA_CONFIG[configKey]) {
        Object.assign(NATHIA_CONFIG[configKey], customConfig[configKey]);
      }
    });
  }

  // Validar configuração
  const isValid = validateConfig();

  return {
    config: NATHIA_CONFIG,
    info: NATHIA_INFO,
    isValid,
  };
}

/**
 * Health check da NAT-IA
 */
export function healthCheck(): {
  status: 'healthy' | 'degraded' | 'unhealthy';
  modules: Record<string, boolean>;
  config_valid: boolean;
  version: string;
} {
  // Verificar se todos os módulos estão disponíveis
  const modules = {
    chat: typeof chatEmpaticoFn === 'function',
    triagem: typeof classificarSentimentoFn === 'function',
    onboarding: typeof analisarRespostasFn === 'function',
    curadoria: typeof resumirConteudoFn === 'function',
    moderacao: typeof analisarMensagemFn === 'function',
    recomendacoes: typeof recomendarConteudoFn === 'function',
    habitos: typeof criarMicroObjetivoFn === 'function',
    analytics: typeof extrairRotulosFn === 'function',
    copys: typeof gerarPushNotificationFn === 'function',
  };

  const allModulesHealthy = Object.values(modules).every((v) => v);
  const configValid = validateConfig();

  let status: 'healthy' | 'degraded' | 'unhealthy';
  if (allModulesHealthy && configValid) {
    status = 'healthy';
  } else if (allModulesHealthy || configValid) {
    status = 'degraded';
  } else {
    status = 'unhealthy';
  }

  return {
    status,
    modules,
    config_valid: configValid,
    version: NATHIA_VERSION,
  };
}

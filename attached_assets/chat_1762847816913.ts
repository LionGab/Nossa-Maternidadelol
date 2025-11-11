/**
 * Módulo NAT-IA Chat Empático
 * Interface para conversas acolhedoras e úteis com mães
 */

import { ChatContext, ChatResponse, SuggestedAction, ValidationError, NathiaError } from './types';
import { SYSTEM_PROMPTS } from './prompts';
import { NATHIA_CONFIG } from './config';
import { logger } from '@/utils/logger';

/**
 * Interface do chat empático da NAT-IA
 *
 * @param mensagem - Mensagem da usuária
 * @param contexto - Contexto da conversa (histórico, perfil, etc)
 * @returns Resposta com ações sugeridas
 *
 * @example
 * ```typescript
 * const resposta = await chatEmpatico(
 *   "Estou muito cansada e não sei se consigo cuidar do bebê",
 *   {
 *     user_id: "123",
 *     current_mood: "worried",
 *     user_profile: { stage: "postpartum" }
 *   }
 * );
 *
 * logger.info(resposta.resposta); // Mensagem empática
 * logger.info(resposta.acoes); // [{ type: "support", label: "Ver recursos" }]
 * logger.info(resposta.next_step); // "Que tal ver artigos sobre autocuidado?"
 * ```
 */
export async function chatEmpatico(mensagem: string, contexto: ChatContext): Promise<ChatResponse> {
  // Validação
  validateChatInput(mensagem, contexto);

  try {
    // Preparar contexto para IA
    const conversationContext = buildConversationContext(contexto);

    // Criar prompt estruturado
    const prompt = buildChatPrompt(mensagem, conversationContext);

    // Retornar estrutura que será usada pela Edge Function
    // A Edge Function fará a chamada real ao Gemini/Claude
    return {
      resposta: '', // Será preenchido pela IA
      acoes: inferSuggestedActions(mensagem, contexto),
      next_step: inferNextStep(mensagem, contexto),
      sentiment_detected: undefined, // Opcional: pode ser populado por triagem
    };
  } catch (error) {
    throw new NathiaError('Erro ao processar chat', 'CHAT_ERROR', { error, mensagem: mensagem.substring(0, 100) });
  }
}

/**
 * Constrói o prompt completo para a IA
 * Inclui system prompt + contexto + mensagem
 */
export function buildChatPrompt(mensagem: string, conversationContext: string): string {
  const systemPrompt = SYSTEM_PROMPTS.CHAT_EMPATICO;

  return `${systemPrompt}

CONTEXTO DA CONVERSA:
${conversationContext}

MENSAGEM ATUAL DA MÃE:
${mensagem}

Responda de forma empática, prática e acolhedora. Sempre sugira um próximo passo concreto.`;
}

/**
 * Constrói contexto da conversa de forma legível
 */
function buildConversationContext(contexto: ChatContext): string {
  const parts: string[] = [];

  // Perfil da usuária
  if (contexto.user_profile) {
    const { stage, concerns, goals } = contexto.user_profile;
    if (stage) parts.push(`Momento: ${stage}`);
    if (concerns?.length) parts.push(`Preocupações: ${concerns.join(', ')}`);
    if (goals?.length) parts.push(`Objetivos: ${goals.join(', ')}`);
  }

  // Humor atual
  if (contexto.current_mood) {
    parts.push(`Humor detectado: ${contexto.current_mood}`);
  }

  // Histórico recente (últimas 3 mensagens)
  if (contexto.conversation_history?.length) {
    const recentHistory = contexto.conversation_history
      .slice(-3)
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join('\n');
    parts.push(`\nHistórico recente:\n${recentHistory}`);
  }

  return parts.join('\n') || 'Primeira interação com a usuária';
}

/**
 * Infere ações sugeridas baseado no conteúdo da mensagem
 * Isso é uma heurística simples - a IA pode refinar
 */
function inferSuggestedActions(mensagem: string, contexto: ChatContext): SuggestedAction[] {
  const actions: SuggestedAction[] = [];
  const lowerMsg = mensagem.toLowerCase();

  // Busca por informação
  if (lowerMsg.includes('como') || lowerMsg.includes('quando') || lowerMsg.includes('o que')) {
    actions.push({
      type: 'content',
      label: 'Ver artigos relacionados',
      action: 'navigate_to_content',
      params: { topic: extractTopic(mensagem) },
    });
  }

  // Busca por conexão
  if (lowerMsg.includes('sozinha') || lowerMsg.includes('alguém') || lowerMsg.includes('outras mães')) {
    actions.push({
      type: 'group',
      label: 'Encontrar grupo de apoio',
      action: 'browse_circles',
      params: { stage: contexto.user_profile?.stage },
    });
  }

  // Busca por mudança de hábito
  if (lowerMsg.includes('quero') || lowerMsg.includes('preciso') || lowerMsg.includes('começar')) {
    actions.push({
      type: 'habit',
      label: 'Criar um objetivo',
      action: 'create_habit',
    });
  }

  // Necessidade de suporte urgente
  if (lowerMsg.includes('ajuda') || lowerMsg.includes('não aguento') || lowerMsg.includes('emergência')) {
    actions.push({
      type: 'support',
      label: 'Ver recursos de apoio',
      action: 'show_support_resources',
    });
  }

  return actions;
}

/**
 * Infere próximo passo sugerido
 */
function inferNextStep(mensagem: string, contexto: ChatContext): string {
  const lowerMsg = mensagem.toLowerCase();

  // Ansiedade/medo
  if (lowerMsg.includes('medo') || lowerMsg.includes('preocupada') || lowerMsg.includes('ansiosa')) {
    return 'Que tal explorar alguns exercícios de respiração e mindfulness?';
  }

  // Cansaço/exaustão
  if (lowerMsg.includes('cansada') || lowerMsg.includes('exausta') || lowerMsg.includes('dormir')) {
    return 'Vou te mostrar dicas sobre sono e descanso para mães.';
  }

  // Informação
  if (lowerMsg.includes('não sei') || lowerMsg.includes('como faço')) {
    return 'Posso te mostrar conteúdos que explicam isso de forma simples.';
  }

  // Social
  if (lowerMsg.includes('sozinha') || lowerMsg.includes('ninguém')) {
    return 'Vamos encontrar outras mães que estão passando por situações parecidas?';
  }

  // Default
  return 'Como posso te ajudar agora?';
}

/**
 * Extrai tópico principal da mensagem (heurística simples)
 */
function extractTopic(mensagem: string): string {
  const topics = NATHIA_CONFIG.analytics.temas_padronizados;
  const lowerMsg = mensagem.toLowerCase();

  for (const topic of topics) {
    if (lowerMsg.includes(topic.replace('_', ' '))) {
      return topic;
    }
  }

  return 'geral';
}

/**
 * Validação de entrada
 */
function validateChatInput(mensagem: string, contexto: ChatContext): void {
  if (!mensagem || typeof mensagem !== 'string') {
    throw new ValidationError('Mensagem é obrigatória e deve ser string');
  }

  if (mensagem.trim().length === 0) {
    throw new ValidationError('Mensagem não pode estar vazia');
  }

  if (mensagem.length > 5000) {
    throw new ValidationError('Mensagem muito longa (máx 5000 caracteres)');
  }

  if (!contexto || !contexto.user_id) {
    throw new ValidationError('Contexto com user_id é obrigatório');
  }

  // Validar histórico não está muito grande
  if (contexto.conversation_history && contexto.conversation_history.length > 100) {
    throw new ValidationError('Histórico de conversa muito longo. Considere iniciar nova sessão');
  }
}

/**
 * Adiciona mensagem ao histórico de conversa
 */
export function addToHistory(contexto: ChatContext, role: 'user' | 'assistant', content: string): ChatContext {
  const newMessage = {
    role,
    content,
    timestamp: new Date(),
  };

  return {
    ...contexto,
    conversation_history: [...(contexto.conversation_history || []), newMessage],
  };
}

/**
 * Cria novo contexto de chat
 */
export function createChatContext(user_id: string, initial_data?: Partial<ChatContext>): ChatContext {
  return {
    user_id,
    conversation_history: [],
    session_id: generateSessionId(),
    ...initial_data,
  };
}

/**
 * Gera ID único de sessão
 */
function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Trunca histórico para manter apenas as mensagens mais recentes
 */
export function truncateHistory(contexto: ChatContext, maxMessages: number = 20): ChatContext {
  if (!contexto.conversation_history) return contexto;

  return {
    ...contexto,
    conversation_history: contexto.conversation_history.slice(-maxMessages),
  };
}

/**
 * Cliente HTTP para Edge Functions da NAT-IA
 *
 * Gerencia todas as requisições para:
 * - nathia-chat: Conversação principal
 * - nathia-onboarding: Fluxo inicial
 * - nathia-recommendations: Sugestões personalizadas
 *
 * Features:
 * - Retry logic com exponential backoff
 * - Timeout configurável (5s padrão)
 * - Error handling gracioso
 * - Validação de resposta
 * - Fallback para modo offline
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { SUPABASE_CONFIG } from '@/config/api';
import { logger } from '@/lib/logger';

// Types
export interface NathiaChatRequest {
  message: string;
  userId: string;
  context: {
    stage?: 'gestante' | 'mae' | 'tentante' | 'puerperio';
    pregnancyWeek?: number;
    mood?: string;
    concerns?: string[];
    previousMessages?: Array<{
      role: 'user' | 'assistant';
      content: string;
    }>;
  };
}

export interface NathiaAction {
  type: 'openScreen' | 'joinCircle' | 'startHabit' | 'showContent' | 'sos';
  label: string;
  data?: {
    screenName?: string;
    circleId?: string;
    habitId?: string;
    contentId?: string;
    url?: string;
  };
}

export interface NathiaChatResponse {
  response: string;
  actions: NathiaAction[];
  suggestedReplies: string[];
  contextUpdate?: {
    mood?: string;
    riskLevel?: 'low' | 'medium' | 'high' | 'critical';
    needsModeration?: boolean;
  };
  safety?: {
    level: 'safe' | 'caution' | 'warning' | 'urgent';
    reasons: string[];
    warning?: string;
    disclaimer?: string;
    supportResources: string[];
  };
  recommendations?: {
    content: string[];
    circles: string[];
    habit?: string | null;
  };
  metadata?: {
    timestamp: string;
    model: string;
    version: string;
    latencyMs: number;
    topics: string[];
  };
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
}

export interface NathiaOnboardingRequest {
  userId: string;
  answers: {
    stage: string;
    pregnancyWeek?: number;
    concerns: string[];
    expectations: string[];
  };
}

export interface NathiaOnboardingResponse {
  welcomeMessage: string;
  starterPack: {
    circles: Array<{ id: string; name: string; reason: string }>;
    habits: Array<{ id: string; name: string; reason: string }>;
    content: Array<{ id: string; title: string; reason: string }>;
  };
}

export interface NathiaRecommendationsRequest {
  userId: string;
  context: {
    stage?: string;
    pregnancyWeek?: number;
    interests?: string[];
  };
}

export interface NathiaRecommendation {
  type: 'circle' | 'habit' | 'content';
  id: string;
  title: string;
  description: string;
  reason: string;
  priority: number;
}

export interface NathiaRecommendationsResponse {
  recommendations: NathiaRecommendation[];
}

export class NathiaClientError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public isNetworkError?: boolean,
    public isTimeout?: boolean
  ) {
    super(message);
    this.name = 'NathiaClientError';
  }
}

class NathiaClient {
  private client: AxiosInstance;
  private maxRetries = 2;
  private timeoutMs = 5000;

  constructor() {
    const baseURL = SUPABASE_CONFIG.URL?.replace(/\/$/, '') + '/functions/v1';

    this.client = axios.create({
      baseURL,
      timeout: this.timeoutMs,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_CONFIG.ANON_KEY}`,
      },
    });

    // Interceptor para logging
    this.client.interceptors.response.use(
      (response) => {
        logger.info('NAT-IA API Success', {
          endpoint: response.config.url,
          status: response.status,
          duration: response.config.headers?.['x-request-duration'],
        });
        return response;
      },
      (error: AxiosError) => {
        // Erros de API precisam incluir contexto (endpoint, status) para rastreabilidade
        logger.error('NAT-IA API Error', error, {
          endpoint: error.config?.url,
          status: error.response?.status,
          message: error.message,
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * Retry com exponential backoff
   */
  private async retryRequest<T>(fn: () => Promise<T>, retries = this.maxRetries): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (retries === 0) throw error;

      const isRetriable = axios.isAxiosError(error) && (!error.response || error.response.status >= 500);

      if (!isRetriable) throw error;

      const delay = Math.min(1000 * 2 ** (this.maxRetries - retries), 4000);
      await new Promise((resolve) => setTimeout(resolve, delay));

      return this.retryRequest(fn, retries - 1);
    }
  }

  /**
   * Handler de erro padronizado
   */
  private handleError(error: unknown): NathiaClientError {
    if (axios.isAxiosError(error)) {
      const isTimeout = error.code === 'ECONNABORTED';
      const isNetworkError = !error.response;

      return new NathiaClientError(
        error.response?.data?.message || error.message,
        error.response?.status,
        isNetworkError,
        isTimeout
      );
    }

    return new NathiaClientError('Erro desconhecido ao conectar com NAT-IA');
  }

  /**
   * Envia mensagem para NAT-IA Chat
   */
  async sendMessage(request: NathiaChatRequest): Promise<NathiaChatResponse> {
    try {
      const response = await this.retryRequest(() => this.client.post<NathiaChatResponse>('/nathia-chat', request));

      const data = response.data;

      // Validar resposta
      if (!data?.response) {
        throw new Error('Resposta inválida da API');
      }

      const normalizedRecommendations = {
        content: data.recommendations?.content ?? [],
        circles: data.recommendations?.circles ?? [],
        habit: data.recommendations?.habit ?? null,
      };

      const normalizedSafety = data.safety
        ? {
            ...data.safety,
            reasons: data.safety.reasons ?? [],
            supportResources: data.safety.supportResources ?? [],
          }
        : undefined;

      return {
        response: data.response,
        actions: data.actions ?? [],
        suggestedReplies: data.suggestedReplies ?? [],
        contextUpdate: data.contextUpdate,
        safety: normalizedSafety,
        recommendations: normalizedRecommendations,
        metadata: data.metadata,
        usage: data.usage,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Processa onboarding inicial
   */
  async processOnboarding(request: NathiaOnboardingRequest): Promise<NathiaOnboardingResponse> {
    try {
      const response = await this.retryRequest(() =>
        this.client.post<NathiaOnboardingResponse>('/nathia-onboarding', request)
      );

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Busca recomendações personalizadas
   */
  async getRecommendations(request: NathiaRecommendationsRequest): Promise<NathiaRecommendationsResponse> {
    try {
      const response = await this.retryRequest(() =>
        this.client.post<NathiaRecommendationsResponse>('/nathia-recommendations', request)
      );

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Health check da API
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.get('/nathia-chat/health');
      return true;
    } catch {
      return false;
    }
  }
}

// Singleton instance
export const nathiaClient = new NathiaClient();

// Helper: Mensagem de fallback offline
export function getOfflineFallbackResponse(): NathiaChatResponse {
  return {
    response:
      'No momento estou offline, mas não se preocupe! Assim que você se conectar novamente, estarei aqui para ajudar. 💙',
    actions: [],
    suggestedReplies: [],
  };
}

// Helper: Validar se está online
export async function isNathiaAvailable(): Promise<boolean> {
  return nathiaClient.healthCheck();
}

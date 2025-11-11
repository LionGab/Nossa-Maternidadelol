/**
 * API Service - Integrações com Edge Functions
 *
 * POST /nathia-chat - Chat com NathIA
 * GET /trending-5min - Conteúdos em 5 minutos
 */

import { SUPABASE_CONFIG } from '@/config/api';
import { logger } from '@/lib/logger';

export interface NathiaChatRequest {
  message: string;
  userId: string;
  context?: {
    stage?: string;
    pregnancyWeek?: number;
    mood?: string;
    concerns?: string[];
  };
}

export interface NathiaChatResponse {
  reply: string;
  actions: Array<{
    type: string;
    label: string;
    data?: any;
  }>;
  safety: {
    level: 'safe' | 'caution' | 'warning' | 'urgent';
    reasons?: string[];
    warning?: string;
    disclaimer?: string;
    supportResources?: string[];
  };
}

export interface Trending5MinCard {
  id: string;
  title: string;
  summary: string;
  bullets: string[];
  reading_time_minutes: number;
  category: string;
  thumbnail_url?: string;
  content_url?: string;
}

export interface Trending5MinResponse {
  cards: Trending5MinCard[];
}

/**
 * Envia mensagem para NathIA Chat
 */
export async function sendNathiaMessage(request: NathiaChatRequest): Promise<NathiaChatResponse> {
  try {
    const response = await fetch(`${SUPABASE_CONFIG.URL}/functions/v1/nathia-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_CONFIG.ANON_KEY}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    logger.error('Erro ao enviar mensagem para NathIA', error);
    throw error;
  }
}

/**
 * Busca conteúdos trending "Em 5 Minutos"
 */
export async function getTrending5Min(): Promise<Trending5MinResponse> {
  try {
    const response = await fetch(`${SUPABASE_CONFIG.URL}/functions/v1/trending-5min`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_CONFIG.ANON_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    logger.error('Erro ao buscar trending 5min', error);
    throw error;
  }
}

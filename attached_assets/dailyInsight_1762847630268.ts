/**
 * Daily Insight Service
 * Gerencia dicas diárias personalizadas geradas por IA
 */

import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DailyInsight {
  id: string;
  user_id: string;
  date: string;
  title: string;
  description: string;
  actionable: string;
  relevance_score: number;
  context_data: {
    userPhase: 'gestante' | 'mae' | 'tentante';
    weekOrAge: number;
    timeOfDay: 'manha' | 'tarde' | 'noite';
    recentTopics: string[];
    hasActiveStreak: boolean;
    recentActivityLevel: number;
    riskLevel: number;
  };
  generated_at: string;
  expires_at: string;
  viewed: boolean;
  viewed_at: string | null;
  created_at: string;
}

/**
 * Busca a dica diária para o usuário
 * Tenta cache local primeiro, depois banco, e finalmente gera nova
 */
export async function getDailyInsight(userId: string): Promise<DailyInsight | null> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `daily_insight_${userId}_${today}`;

    // 1. Verificar cache local
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      // Verificar se não expirou
      if (new Date(parsed.expires_at) > new Date()) {
        console.log('[DailyInsight] Retornando do cache local');
        return parsed;
      }
    }

    // 2. Buscar do banco
    const { data, error } = await supabase
      .from('daily_insights')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    if (data && !error) {
      // Verificar se não expirou
      if (new Date(data.expires_at) > new Date()) {
        // Salvar em cache
        await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
        console.log('[DailyInsight] Retornando do banco');
        return data;
      }
    }

    // 3. Gerar nova dica
    console.log('[DailyInsight] Gerando nova dica...');
    return await generateDailyInsight(userId);
  } catch (error) {
    console.error('[DailyInsight] Error fetching:', error);
    return null;
  }
}

/**
 * Gera uma nova dica diária chamando a Edge Function
 */
export async function generateDailyInsight(userId: string, forceRegenerate = false): Promise<DailyInsight | null> {
  try {
    const { data, error } = await supabase.functions.invoke('daily-insight', {
      body: { userId, forceRegenerate },
    });

    if (error) {
      throw error;
    }

    const insight = data.insight as DailyInsight;

    // Salvar em cache local
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `daily_insight_${userId}_${today}`;
    await AsyncStorage.setItem(cacheKey, JSON.stringify(insight));

    console.log('[DailyInsight] Nova dica gerada com sucesso');
    return insight;
  } catch (error) {
    console.error('[DailyInsight] Error generating:', error);
    return null;
  }
}

/**
 * Marca a dica como visualizada
 */
export async function markInsightAsViewed(insightId: string): Promise<void> {
  try {
    await supabase
      .from('daily_insights')
      .update({
        viewed: true,
        viewed_at: new Date().toISOString(),
      })
      .eq('id', insightId);
  } catch (error) {
    console.error('[DailyInsight] Error marking as viewed:', error);
  }
}

/**
 * Limpa o cache de dicas antigas
 */
export async function clearOldInsightCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const insightKeys = keys.filter((key) => key.startsWith('daily_insight_'));

    // Remover keys de dias anteriores
    const today = new Date().toISOString().split('T')[0];
    const oldKeys = insightKeys.filter((key) => !key.includes(today));

    if (oldKeys.length > 0) {
      await AsyncStorage.multiRemove(oldKeys);
      console.log(`[DailyInsight] Removidos ${oldKeys.length} caches antigos`);
    }
  } catch (error) {
    console.error('[DailyInsight] Error clearing cache:', error);
  }
}

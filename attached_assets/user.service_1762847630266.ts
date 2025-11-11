/**
 * User Service
 * Serviço para gerenciar perfil do usuário
 */

import { supabase, UserProfile } from './supabase';
import { OnboardingData } from '@/types/onboarding.types';

export interface UserProfileData {
  id: string;
  name: string;
  email?: string;
  maternal_stage: 'tentante' | 'gestante' | 'puerperio' | 'mae_estabelecida' | 'mae';
  pregnancy_week?: number;
  baby_name?: string;
  baby_age_months?: number;
  baby_age_weeks?: number;
  preferences: string[];
  subscription_tier: 'free' | 'premium';
  daily_interactions: number;
  last_interaction_date: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Cria perfil inicial do usuário
 */
export async function createUserProfile(userId: string, data: Partial<UserProfileData>): Promise<UserProfileData> {
  try {
    const profile: Partial<UserProfile> = {
      id: userId,
      name: data.name || '',
      email: data.email,
      type: data.maternal_stage || 'mae',
      pregnancy_week: data.pregnancy_week,
      baby_name: data.baby_name,
      preferences: data.preferences || [],
      subscription_tier: data.subscription_tier || 'free',
      daily_interactions: 0,
      last_interaction_date: new Date().toISOString(),
    };

    const { data: createdProfile, error } = await supabase.from('user_profiles').insert(profile).select().single();

    if (error) throw error;
    return createdProfile as UserProfileData;
  } catch (error) {
    console.error('Erro ao criar perfil:', error);
    throw error;
  }
}

/**
 * Busca perfil do usuário
 */
export async function getUserProfile(userId: string): Promise<UserProfileData | null> {
  try {
    const { data, error } = await supabase.from('user_profiles').select('*').eq('id', userId).single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Não encontrado
        return null;
      }
      throw error;
    }

    return data as UserProfileData;
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return null;
  }
}

/**
 * Atualiza perfil do usuário
 */
export async function updateUserProfile(userId: string, updates: Partial<UserProfileData>): Promise<UserProfileData> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as UserProfileData;
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    throw error;
  }
}

/**
 * Cria ou atualiza perfil (upsert)
 */
export async function upsertUserProfile(userId: string, data: Partial<UserProfileData>): Promise<UserProfileData> {
  try {
    const profile: Partial<UserProfile> = {
      id: userId,
      name: data.name,
      email: data.email,
      type: data.maternal_stage,
      pregnancy_week: data.pregnancy_week,
      baby_name: data.baby_name,
      preferences: data.preferences || [],
      subscription_tier: data.subscription_tier || 'free',
      daily_interactions: data.daily_interactions || 0,
      last_interaction_date: new Date().toISOString(),
    };

    const { data: upsertedProfile, error } = await supabase
      .from('user_profiles')
      .upsert(profile, { onConflict: 'id' })
      .select()
      .single();

    if (error) throw error;
    return upsertedProfile as UserProfileData;
  } catch (error) {
    console.error('Erro ao criar/atualizar perfil:', error);
    throw error;
  }
}

/**
 * Incrementa interações diárias
 */
export async function incrementDailyInteractions(userId: string): Promise<void> {
  try {
    const profile = await getUserProfile(userId);
    if (!profile) return;

    await updateUserProfile(userId, {
      daily_interactions: (profile.daily_interactions || 0) + 1,
      last_interaction_date: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erro ao incrementar interações:', error);
  }
}

/**
 * Onboarding Service
 * Serviço completo de onboarding conversacional com perguntas profundas
 * que ajudam a NathIA entender o momento emocional e situacional da mãe
 */

import { supabase, UserProfile } from './supabase';
import {
  OnboardingData,
  OnboardingQuestion,
  OnboardingResponse,
  OnboardingStep,
  SupportNetworkLevel,
  getQuestionsByStep,
} from '@/types/onboarding.types';

export interface OnboardingProgress {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  progress: number;
  data: Partial<OnboardingData>;
}

const SUPPORT_NETWORK_VALUES: SupportNetworkLevel[] = ['muito', 'algum', 'pouco', 'nenhum'];
const SELF_CARE_VALUES: NonNullable<OnboardingData['self_care_frequency']>[] = [
  'nunca',
  'raramente',
  'as-vezes',
  'frequentemente',
];

function normalizeSupportNetwork(value: unknown): SupportNetworkLevel | undefined {
  if (typeof value === 'string') {
    if ((SUPPORT_NETWORK_VALUES as readonly string[]).includes(value)) {
      return value as SupportNetworkLevel;
    }
    if (value === 'true') return 'muito';
    if (value === 'partial') return 'algum';
    if (value === 'little') return 'pouco';
    if (value === 'false') return 'nenhum';
  }
  if (typeof value === 'boolean') {
    return value ? 'muito' : 'nenhum';
  }
  return undefined;
}

function resolveSupportNetworkLevel(
  level?: SupportNetworkLevel | string | null,
  legacy?: boolean | string | null
): SupportNetworkLevel | undefined {
  return normalizeSupportNetwork(level) ?? normalizeSupportNetwork(legacy);
}

function normalizeSelfCareFrequency(value: unknown): OnboardingData['self_care_frequency'] | undefined {
  if (typeof value === 'string' && (SELF_CARE_VALUES as readonly string[]).includes(value)) {
    return value as OnboardingData['self_care_frequency'];
  }
  return undefined;
}

/**
 * Salva resposta individual do onboarding
 */
export async function saveOnboardingResponse(
  userId: string,
  questionId: string,
  value: string | string[] | number
): Promise<void> {
  try {
    const response: OnboardingResponse = {
      questionId,
      value,
      timestamp: new Date().toISOString(),
    };

    const { error } = await supabase.from('onboarding_responses').upsert({
      user_id: userId,
      question_id: questionId,
      response_value: value,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao salvar resposta do onboarding:', error);
    throw error;
  }
}

/**
 * Salva dados completos do onboarding
 */
export async function saveOnboardingData(userId: string, data: Partial<OnboardingData>): Promise<void> {
  try {
    // Salvar perfil do usuário
    // Mapear maternal_stage para type do UserProfile
    const mapMaternalStageToType = (
      stage?: string
    ): 'gestante' | 'mae' | 'tentante' | 'puerperio' | 'mae_estabelecida' => {
      if (!stage) return 'mae';
      if (stage === 'puerperio' || stage === 'mae_estabelecida') return stage as any;
      return stage as 'gestante' | 'mae' | 'tentante';
    };

    const profile: Partial<UserProfile> = {
      id: userId,
      name: data.name || '',
      type: mapMaternalStageToType(data.maternal_stage),
      pregnancy_week: data.pregnancy_week,
      baby_name: data.baby_name,
      preferences: data.content_preferences || [],
      subscription_tier: 'free',
      daily_interactions: 0,
      last_interaction_date: new Date().toISOString(),
    };

    const { error: profileError } = await supabase.from('user_profiles').upsert(profile, { onConflict: 'id' });

    if (profileError) throw profileError;

    // Salvar dados emocionais e situacionais em tabela separada
    const supportNetworkLevel = resolveSupportNetworkLevel(
      data.support_network_level,
      (data as any).has_support_network
    );
    const supportNetworkFlag = supportNetworkLevel === undefined ? undefined : supportNetworkLevel !== 'nenhum';

    const onboardingPayload: Record<string, unknown> = {
      user_id: userId,
      emotional_state: data.emotional_state,
      stress_level: data.stress_level,
      sleep_quality: data.sleep_quality,
      energy_level: data.energy_level,
      main_challenges: data.main_challenges || [],
      specific_challenges: data.specific_challenges,
      support_needs: data.support_needs || [],
      support_network_description: data.support_network_description,
      main_goals: data.main_goals || [],
      what_brings_you_here: data.what_brings_you_here,
      communication_style: data.communication_style,
      partner_support: data.partner_support,
      family_support: data.family_support,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (supportNetworkFlag !== undefined) {
      onboardingPayload.has_support_network = supportNetworkFlag;
    }

    const { error: onboardingError } = await supabase
      .from('onboarding_data')
      .upsert(onboardingPayload, { onConflict: 'user_id' });

    if (onboardingError) throw onboardingError;

    // Salvar todas as respostas individuais
    if (data.responses && data.responses.length > 0) {
      for (const response of data.responses) {
        await saveOnboardingResponse(userId, response.questionId, response.value);
      }
    }
  } catch (error) {
    console.error('Erro ao salvar dados do onboarding:', error);
    throw error;
  }
}

/**
 * Busca dados do onboarding do usuário
 */
export async function getOnboardingData(userId: string): Promise<Partial<OnboardingData> | null> {
  try {
    // Buscar perfil
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;
    if (!profile) return null;

    // Buscar dados emocionais/situacionais
    const { data: onboardingData, error: onboardingError } = await supabase
      .from('onboarding_data')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (onboardingError && onboardingError.code !== 'PGRST116') {
      // PGRST116 = não encontrado, não é erro crítico
      throw onboardingError;
    }

    // Buscar respostas individuais
    const { data: responses, error: responsesError } = await supabase
      .from('onboarding_responses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (responsesError) throw responsesError;

    const responsesList = responses || [];
    const supportNetworkFromResponses = normalizeSupportNetwork(
      responsesList.find((response) => response.question_id === 'support_network_level')?.response_value
    );
    const selfCareFromResponses = normalizeSelfCareFrequency(
      responsesList.find((response) => response.question_id === 'self_care_frequency')?.response_value
    );

    // Montar objeto completo
    const data: Partial<OnboardingData> = {
      name: profile.name,
      maternal_stage: profile.type as any,
      pregnancy_week: profile.pregnancy_week,
      baby_name: profile.baby_name,
      content_preferences: profile.preferences || [],
      responses: responsesList.map((r) => ({
        questionId: r.question_id,
        value: r.response_value,
        timestamp: r.created_at,
      })),
    };

    if (onboardingData) {
      Object.assign(data, {
        emotional_state: onboardingData.emotional_state,
        stress_level: onboardingData.stress_level,
        sleep_quality: onboardingData.sleep_quality,
        energy_level: onboardingData.energy_level,
        self_care_frequency: selfCareFromResponses ?? normalizeSelfCareFrequency(onboardingData.self_care_frequency),
        main_challenges: onboardingData.main_challenges || [],
        specific_challenges: onboardingData.specific_challenges,
        support_needs: onboardingData.support_needs || [],
        support_network_level:
          supportNetworkFromResponses ??
          resolveSupportNetworkLevel(onboardingData.support_network_level, onboardingData.has_support_network),
        support_network_description: onboardingData.support_network_description,
        main_goals: onboardingData.main_goals || [],
        what_brings_you_here: onboardingData.what_brings_you_here,
        communication_style: onboardingData.communication_style,
        partner_support: onboardingData.partner_support,
        family_support: onboardingData.family_support,
        completed_at: onboardingData.completed_at,
      });
    }

    return data;
  } catch (error) {
    console.error('Erro ao buscar dados do onboarding:', error);
    return null;
  }
}

/**
 * Verifica se usuário completou onboarding
 */
export async function hasCompletedOnboarding(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('onboarding_data')
      .select('completed_at')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return !!data?.completed_at;
  } catch (error) {
    console.error('Erro ao verificar onboarding:', error);
    return false;
  }
}

/**
 * Gera contexto para NathIA baseado no onboarding
 * Este contexto ajuda a IA entender o momento da pessoa
 */
export function generateNathIAContext(data: Partial<OnboardingData>): string {
  const contextParts: string[] = [];

  // Informações básicas
  if (data.name) {
    contextParts.push(`Nome: ${data.name}`);
  }
  if (data.maternal_stage) {
    const stageLabels: Record<string, string> = {
      tentante: 'Tentante (tentando engravidar)',
      gestante: 'Gestante',
      puerperio: 'Puerpério (até 1 ano após o parto)',
      mae_estabelecida: 'Mãe estabelecida',
    };
    contextParts.push(`Estágio: ${stageLabels[data.maternal_stage] || data.maternal_stage}`);
  }
  if (data.pregnancy_week) {
    contextParts.push(`Semana de gestação: ${data.pregnancy_week}`);
  }
  if (data.baby_name) {
    contextParts.push(`Nome do bebê: ${data.baby_name}`);
  }

  // Estado emocional
  if (data.emotional_state) {
    contextParts.push(`Estado emocional atual: ${data.emotional_state}`);
  }
  if (data.stress_level !== undefined) {
    contextParts.push(`Nível de estresse: ${data.stress_level}/10`);
  }
  if (data.sleep_quality) {
    contextParts.push(`Qualidade do sono: ${data.sleep_quality}`);
  }
  if (data.energy_level !== undefined) {
    contextParts.push(`Nível de energia: ${data.energy_level}/10`);
  }
  if (data.self_care_frequency) {
    const selfCareLabels: Record<NonNullable<OnboardingData['self_care_frequency']>, string> = {
      nunca: 'Quase nunca consegue tempo para si',
      raramente: 'Raramente encontra tempo para autocuidado',
      'as-vezes': 'Às vezes consegue dedicar tempo para si',
      frequentemente: 'Consegue se cuidar com frequência',
    };
    contextParts.push(`Autocuidado: ${selfCareLabels[data.self_care_frequency]}`);
  }

  // Desafios
  if (data.main_challenges && data.main_challenges.length > 0) {
    contextParts.push(`Principais desafios: ${data.main_challenges.join(', ')}`);
  }
  if (data.specific_challenges) {
    contextParts.push(`Desafios específicos: ${data.specific_challenges}`);
  }

  // Necessidades
  if (data.support_needs && data.support_needs.length > 0) {
    contextParts.push(`Necessidades de suporte: ${data.support_needs.join(', ')}`);
  }
  const supportNetworkLevel = resolveSupportNetworkLevel(data.support_network_level, (data as any).has_support_network);
  if (supportNetworkLevel) {
    const supportLabels: Record<SupportNetworkLevel, string> = {
      muito: 'Muito apoio disponível',
      algum: 'Algum apoio disponível',
      pouco: 'Pouco apoio disponível',
      nenhum: 'Sem rede de apoio',
    };
    contextParts.push(`Rede de apoio: ${supportLabels[supportNetworkLevel]}`);
  }
  if (data.support_network_description) {
    contextParts.push(`Descrição da rede de apoio: ${data.support_network_description}`);
  }

  // Objetivos
  if (data.main_goals && data.main_goals.length > 0) {
    contextParts.push(`Objetivos no app: ${data.main_goals.join(', ')}`);
  }
  if (data.what_brings_you_here) {
    contextParts.push(`O que trouxe até aqui: ${data.what_brings_you_here}`);
  }

  // Preferências
  if (data.communication_style) {
    contextParts.push(`Estilo de comunicação preferido: ${data.communication_style}`);
  }
  if (data.content_preferences && data.content_preferences.length > 0) {
    contextParts.push(`Interesses: ${data.content_preferences.join(', ')}`);
  }

  // Contexto familiar
  if (data.partner_support) {
    contextParts.push(`Suporte do parceiro: ${data.partner_support}`);
  }
  if (data.family_support) {
    contextParts.push(`Suporte da família: ${data.family_support}`);
  }

  return contextParts.join('\n');
}

/**
 * Obtém perguntas do step atual
 */
export function getCurrentStepQuestions(step: OnboardingStep): OnboardingQuestion[] {
  return getQuestionsByStep(step);
}

/**
 * Valida se step está completo
 */
export function validateStep(
  step: OnboardingStep,
  data: Partial<OnboardingData>
): {
  isValid: boolean;
  missingFields: string[];
} {
  const questions = getCurrentStepQuestions(step);
  const missingFields: string[] = [];

  for (const question of questions) {
    if (question.required) {
      const value = (data as any)[question.id];
      if (!value || (Array.isArray(value) && value.length === 0)) {
        missingFields.push(question.id);
      }
    }
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
}

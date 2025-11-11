/**
 * Módulo NAT-IA Recomendações Personalizadas
 * Sistema inteligente de recomendação de conteúdo, círculos e hábitos
 */

import {
  RecommendationContext,
  ContentRecommendations,
  CircleRecommendations,
  HabitRecommendation,
  ContentRecommendation,
  GroupRecommendation,
  Habit,
  MicroGoal,
  UserProfile,
  ValidationError,
  NathiaError,
} from './types';
import { SYSTEM_PROMPTS } from './prompts';
import { NATHIA_CONFIG } from './config';

/**
 * Recomenda conteúdos personalizados
 *
 * @param user_id - ID da usuária
 * @param contexto - Contexto de recomendação
 * @returns Conteúdos recomendados com justificativa
 *
 * @example
 * ```typescript
 * const recs = await recomendarConteudo("user_123", {
 *   current_mood: "worried",
 *   current_stage: "mid",
 *   recent_activity: ["sono", "amamentacao"]
 * });
 * // { itens: [...], justificativa: "...", algorithm_version: "1.0.0" }
 * ```
 */
export async function recomendarConteudo(
  user_id: string,
  contexto: Partial<RecommendationContext>
): Promise<ContentRecommendations> {
  validateUserId(user_id);

  try {
    const fullContext: RecommendationContext = {
      user_id,
      ...contexto,
    };

    // Obter conteúdos disponíveis (mock - na prática buscar do DB)
    const availableContent = await fetchAvailableContent();

    // Calcular scores para cada conteúdo
    const scoredContent = availableContent.map((content) => ({
      ...content,
      match_score: calculateContentScore(content, fullContext),
      reason: generateRecommendationReason(content, fullContext),
    }));

    // Ordenar por score e pegar top N
    const config = NATHIA_CONFIG.recomendacoes;
    const topContent = scoredContent
      .filter((c) => c.match_score >= config.min_match_score)
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, config.max_conteudos);

    // Gerar justificativa geral
    const justificativa = generateOverallJustification(topContent, fullContext);

    return {
      itens: topContent,
      justificativa,
      algorithm_version: NATHIA_CONFIG.geral.version,
    };
  } catch (error) {
    throw new NathiaError('Erro ao recomendar conteúdo', 'CONTENT_RECOMMENDATION_ERROR', { error });
  }
}

/**
 * Recomenda círculos (grupos) personalizados
 *
 * @param user_id - ID da usuária
 * @param interesses - Interesses da usuária
 * @returns Círculos recomendados com match scores
 *
 * @example
 * ```typescript
 * const circles = await recomendarCirculo("user_123", {
 *   stage: "postpartum",
 *   concerns: ["sono", "saude_mental"]
 * });
 * // { circulos: [...], match_scores: { "circle_1": 0.85 } }
 * ```
 */
export async function recomendarCirculo(
  user_id: string,
  interesses: Partial<UserProfile>
): Promise<CircleRecommendations> {
  validateUserId(user_id);

  try {
    // Obter círculos disponíveis
    const availableCircles = await fetchAvailableCircles();

    // Calcular match scores
    const scoredCircles = availableCircles.map((circle) => ({
      ...circle,
      match_score: calculateCircleScore(circle, interesses),
      reason: generateCircleReason(circle, interesses),
    }));

    // Filtrar e ordenar
    const config = NATHIA_CONFIG.recomendacoes;
    const topCircles = scoredCircles
      .filter((c) => c.match_score >= config.min_match_score)
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, config.max_circulos);

    // Criar map de scores
    const match_scores: Record<string, number> = {};
    topCircles.forEach((c) => {
      match_scores[c.id] = c.match_score;
    });

    return {
      circulos: topCircles,
      match_scores,
    };
  } catch (error) {
    throw new NathiaError('Erro ao recomendar círculos', 'CIRCLE_RECOMMENDATION_ERROR', { error });
  }
}

/**
 * Recomenda hábito personalizado
 *
 * @param user_id - ID da usuária
 * @param objetivos - Objetivos da usuária
 * @returns Hábito recomendado com micro-objetivos
 *
 * @example
 * ```typescript
 * const habit = await recomendarHabito("user_123", {
 *   goals: ["saude_mental", "autocuidado"]
 * });
 * // { habito: {...}, micro_objetivos: [...], justificativa: "..." }
 * ```
 */
export async function recomendarHabito(user_id: string, objetivos: Partial<UserProfile>): Promise<HabitRecommendation> {
  validateUserId(user_id);

  try {
    // Obter hábitos disponíveis
    const availableHabits = await fetchAvailableHabits();

    // Calcular scores
    const scoredHabits = availableHabits.map((habit) => ({
      habit,
      score: calculateHabitScore(habit, objetivos),
    }));

    // Selecionar melhor hábito
    const bestMatch = scoredHabits.sort((a, b) => b.score - a.score)[0];

    if (!bestMatch || bestMatch.score < NATHIA_CONFIG.recomendacoes.min_match_score) {
      // Retornar hábito genérico
      return getDefaultHabitRecommendation();
    }

    // Gerar micro-objetivos para o hábito
    const micro_objetivos = await generateMicroGoals(bestMatch.habit);

    // Gerar justificativa
    const justificativa = generateHabitJustification(bestMatch.habit, objetivos);

    return {
      habito: bestMatch.habit,
      micro_objetivos,
      justificativa,
    };
  } catch (error) {
    throw new NathiaError('Erro ao recomendar hábito', 'HABIT_RECOMMENDATION_ERROR', { error });
  }
}

/**
 * Re-ranqueia recomendações baseado em feedback
 *
 * @param recommendations - Recomendações originais
 * @param feedback - Feedback da usuária (liked/disliked/clicked)
 * @returns Recomendações ajustadas
 */
export function rerankWithFeedback<T extends { id: string; match_score: number }>(
  recommendations: T[],
  feedback: { id: string; action: 'like' | 'dislike' | 'click' | 'ignore' }[]
): T[] {
  const feedbackMap = new Map(feedback.map((f) => [f.id, f.action]));

  const reranked = recommendations.map((rec) => {
    const action = feedbackMap.get(rec.id);
    let adjustedScore = rec.match_score;

    switch (action) {
      case 'like':
        adjustedScore *= 1.3;
        break;
      case 'click':
        adjustedScore *= 1.2;
        break;
      case 'dislike':
        adjustedScore *= 0.5;
        break;
      case 'ignore':
        adjustedScore *= 0.9;
        break;
    }

    return {
      ...rec,
      match_score: Math.min(adjustedScore, 1.0),
    };
  });

  return reranked.sort((a, b) => b.match_score - a.match_score);
}

// ============= Score Calculation =============

function calculateContentScore(content: ContentRecommendation, context: RecommendationContext): number {
  const weights = NATHIA_CONFIG.recomendacoes.pesos;
  let score = 0;

  // Stage match
  if (context.current_stage && content.title.toLowerCase().includes(context.current_stage)) {
    score += weights.stage_match;
  }

  // Interest/Activity match
  if (context.recent_activity) {
    const activityMatch = context.recent_activity.some((activity) =>
      content.title.toLowerCase().includes(activity.toLowerCase())
    );
    if (activityMatch) score += weights.interest_match;
  }

  // Mood-based recommendations
  if (context.current_mood) {
    const moodScore = getMoodContentScore(context.current_mood, content);
    score += moodScore * weights.recent_activity;
  }

  // Trending bonus (mock - na prática usar analytics)
  const isTrending = Math.random() > 0.7; // Mock
  if (isTrending) score += weights.trending;

  return Math.min(score, 1.0);
}

function calculateCircleScore(circle: GroupRecommendation, profile: Partial<UserProfile>): number {
  let score = 0.3; // Base score

  // Stage match
  if (profile.stage && circle.name.toLowerCase().includes(profile.stage)) {
    score += 0.3;
  }

  // Concern match
  if (profile.concerns) {
    const concernMatch = profile.concerns.some((concern) =>
      circle.name.toLowerCase().includes(concern.replace('_', ' '))
    );
    if (concernMatch) score += 0.25;
  }

  // Interest match
  if (profile.interests) {
    const interestMatch = profile.interests.some((interest) =>
      circle.description.toLowerCase().includes(interest.replace('_', ' '))
    );
    if (interestMatch) score += 0.15;
  }

  return Math.min(score, 1.0);
}

function calculateHabitScore(habit: Habit, profile: Partial<UserProfile>): number {
  let score = 0.3; // Base score

  // Goal alignment
  if (profile.goals) {
    const goalMatch = profile.goals.some(
      (goal) =>
        habit.category.toLowerCase().includes(goal.replace('_', ' ')) ||
        habit.title.toLowerCase().includes(goal.replace('_', ' '))
    );
    if (goalMatch) score += 0.4;
  }

  // Difficulty match (easier habits for beginners)
  if (habit.difficulty === 'easy') score += 0.2;
  else if (habit.difficulty === 'medium') score += 0.1;

  return Math.min(score, 1.0);
}

function getMoodContentScore(mood: string, content: ContentRecommendation): number {
  const moodContentMap: Record<string, string[]> = {
    worried: ['guia', 'informação', 'checklist', 'preparação'],
    sad: ['autocuidado', 'apoio', 'mental', 'emocional'],
    tired: ['sono', 'descanso', 'energia', 'rotina'],
    happy: ['desenvolvimento', 'marcos', 'celebrar'],
    anxious: ['respiração', 'mindfulness', 'calma', 'relaxamento'],
  };

  const relevantKeywords = moodContentMap[mood] || [];
  const contentLower = content.title.toLowerCase();

  const matches = relevantKeywords.filter((keyword) => contentLower.includes(keyword));
  return matches.length > 0 ? 0.3 : 0;
}

// ============= Reason Generation =============

function generateRecommendationReason(content: ContentRecommendation, context: RecommendationContext): string {
  const reasons: string[] = [];

  if (context.current_stage && content.title.toLowerCase().includes(context.current_stage)) {
    reasons.push('alinhado com sua fase atual');
  }

  if (context.recent_activity?.some((a) => content.title.toLowerCase().includes(a.toLowerCase()))) {
    reasons.push('relacionado ao que você tem buscado');
  }

  if (context.current_mood) {
    reasons.push('útil para como você está se sentindo agora');
  }

  return reasons.length > 0 ? reasons.join(', ') : 'conteúdo relevante para sua jornada';
}

function generateCircleReason(circle: GroupRecommendation, profile: Partial<UserProfile>): string {
  if (profile.stage && circle.name.toLowerCase().includes(profile.stage)) {
    return `Outras mães na mesma fase que você`;
  }

  if (profile.concerns?.some((c) => circle.name.toLowerCase().includes(c))) {
    return `Comunidade focada em suas preocupações`;
  }

  return `Espaço acolhedor para compartilhar experiências`;
}

function generateHabitJustification(habit: Habit, profile: Partial<UserProfile>): string {
  return `Este hábito vai te ajudar a ${habit.description.toLowerCase()}, alinhado com seus objetivos de ${profile.goals?.join(' e ') || 'bem-estar'}.`;
}

function generateOverallJustification(content: ContentRecommendation[], context: RecommendationContext): string {
  if (content.length === 0) {
    return 'Não encontramos conteúdos específicos agora, mas continue explorando!';
  }

  const reasons: string[] = [];

  if (context.current_stage) {
    reasons.push(`conteúdos para sua fase atual (${context.current_stage})`);
  }

  if (context.recent_activity && context.recent_activity.length > 0) {
    reasons.push(`baseado em seus interesses: ${context.recent_activity.slice(0, 2).join(', ')}`);
  }

  if (reasons.length === 0) {
    return 'Selecionamos conteúdos relevantes para você';
  }

  return `Recomendamos ${reasons.join(' e ')}`;
}

// ============= Mock Data Functions =============

async function fetchAvailableContent(): Promise<ContentRecommendation[]> {
  // Mock - na prática buscar do banco de dados
  return [
    {
      id: 'content_1',
      title: 'Guia do Segundo Trimestre',
      type: 'article',
      match_score: 0,
      reason: '',
      estimated_time: '10 min',
    },
    {
      id: 'content_2',
      title: 'Sono do Recém-Nascido: O Que Esperar',
      type: 'article',
      match_score: 0,
      reason: '',
      estimated_time: '8 min',
    },
    {
      id: 'content_3',
      title: 'Checklist: Bolsa da Maternidade',
      type: 'checklist',
      match_score: 0,
      reason: '',
      estimated_time: '5 min',
    },
  ];
}

async function fetchAvailableCircles(): Promise<GroupRecommendation[]> {
  return [
    {
      id: 'circle_1',
      name: 'Mães do Segundo Trimestre',
      description: 'Compartilhe experiências com outras mães na mesma fase',
      match_score: 0,
      reason: '',
    },
    {
      id: 'circle_2',
      name: 'Sono e Rotina',
      description: 'Dicas e apoio sobre sono do bebê',
      match_score: 0,
      reason: '',
    },
  ];
}

async function fetchAvailableHabits(): Promise<Habit[]> {
  return [
    {
      id: 'habit_1',
      title: 'Journaling Materno',
      description: 'Registrar pensamentos e emoções diariamente',
      category: 'saude_mental',
      frequency: 'daily',
      difficulty: 'easy',
    },
    {
      id: 'habit_2',
      title: 'Caminhada Diária',
      description: 'Caminhar 15 minutos por dia',
      category: 'saude_fisica',
      frequency: 'daily',
      difficulty: 'easy',
    },
  ];
}

async function generateMicroGoals(habit: Habit): Promise<MicroGoal[]> {
  // Simplificado - seria gerado pela IA
  return [
    {
      titulo: `Começar ${habit.title.toLowerCase()}`,
      passos: ['Definir horário do dia', 'Preparar material necessário', 'Fazer primeira tentativa'],
      prazo_dias: 3,
      difficulty: 'easy',
    },
  ];
}

function getDefaultHabitRecommendation(): HabitRecommendation {
  return {
    habito: {
      id: 'default_habit',
      title: 'Momento de Pausa',
      description: 'Tirar 5 minutos para respirar e relaxar',
      category: 'autocuidado',
      frequency: 'daily',
      difficulty: 'easy',
    },
    micro_objetivos: [
      {
        titulo: 'Começar com pausas curtas',
        passos: ['Escolher horário fixo', 'Encontrar lugar tranquilo', 'Fazer 5 respirações profundas'],
        prazo_dias: 7,
        difficulty: 'easy',
      },
    ],
    justificativa: 'Um hábito simples e essencial para começar a cuidar de você',
  };
}

// ============= Validação =============

function validateUserId(user_id: string): void {
  if (!user_id || typeof user_id !== 'string') {
    throw new ValidationError('user_id é obrigatório e deve ser string');
  }
}

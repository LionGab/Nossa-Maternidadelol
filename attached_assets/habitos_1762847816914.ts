/**
 * Módulo NAT-IA Hábitos & Coaching
 * Sistema de criação e acompanhamento de hábitos com coaching empático
 */

import { MicroGoal, MotivationalMessage, HabitProgress, Habit, ValidationError, NathiaError } from './types';
import { SYSTEM_PROMPTS } from './prompts';
import { NATHIA_CONFIG } from './config';
import { logger } from '@/utils/logger';

/**
 * Cria micro-objetivos a partir de objetivo geral
 *
 * @param objetivo_geral - Objetivo amplo da usuária
 * @returns Micro-objetivos acionáveis
 *
 * @example
 * ```typescript
 * const micro = await criarMicroObjetivo(
 *   "Quero fazer exercícios regularmente"
 * );
 * // { titulo: "Começar com 5 minutos", passos: [...], prazo_dias: 7 }
 * ```
 */
export async function criarMicroObjetivo(objetivo_geral: string): Promise<MicroGoal> {
  validateObjetivo(objetivo_geral);

  try {
    // Analisar complexidade do objetivo
    const difficulty = inferDifficulty(objetivo_geral);

    // Gerar passos práticos
    const passos = generatePracticalSteps(objetivo_geral);

    // Determinar prazo razoável
    const prazo_dias = calculateRealisticDeadline(objetivo_geral, difficulty);

    // Gerar título do micro-objetivo
    const titulo = generateMicroGoalTitle(objetivo_geral);

    // Preparar prompt para IA refinar
    const prompt = buildMicroObjetivoPrompt(objetivo_geral);

    return {
      titulo,
      passos,
      prazo_dias,
      difficulty,
      parent_goal: objetivo_geral,
    };
  } catch (error) {
    throw new NathiaError('Erro ao criar micro-objetivo', 'MICRO_GOAL_ERROR', { error });
  }
}

/**
 * Gera mensagem motivacional personalizada
 *
 * @param progresso - Progresso atual do hábito
 * @returns Mensagem motivacional NÃO comparativa
 *
 * @example
 * ```typescript
 * const msg = gerarMensagemMotivacional({
 *   streak: 5,
 *   completude: 70,
 *   last_completed: new Date()
 * });
 * // { mensagem: "5 dias seguidos! Você está construindo...", tone: "celebrating" }
 * ```
 */
export function gerarMensagemMotivacional(progresso: HabitProgress): MotivationalMessage {
  const { streak, completude, last_completed, total_completions } = progresso;

  let mensagem = '';
  let tone: MotivationalMessage['tone'] = 'encouraging';

  // Celebrar milestones
  if (streak >= NATHIA_CONFIG.habitos.streak_celebracao) {
    tone = 'celebrating';
    mensagem = generateCelebrationMessage(streak, total_completions);
  }
  // Encorajar progresso contínuo
  else if (completude >= 50) {
    tone = 'encouraging';
    mensagem = generateEncouragementMessage(completude);
  }
  // Lembrete gentil para retomar
  else if (!last_completed || daysSince(last_completed) > 3) {
    tone = 'gentle_reminder';
    mensagem = generateGentleReminderMessage();
  }
  // Apoio geral
  else {
    tone = 'supportive';
    mensagem = generateSupportiveMessage();
  }

  return {
    mensagem,
    tone,
    avoid_comparison: true,
  };
}

/**
 * Gera lembrete gentil sobre hábito
 *
 * @param habito - Hábito a ser lembrado
 * @returns Mensagem empática de lembrete
 *
 * @example
 * ```typescript
 * const lembrete = gerarLembreteGentil({
 *   id: "habit_1",
 *   title: "Journaling",
 *   description: "Escrever sobre o dia"
 * });
 * // "Oi! Que tal reservar alguns minutos para o journaling hoje? ..."
 * ```
 */
export function gerarLembreteGentil(habito: Habit): string {
  const templates = [
    `Oi! Que tal reservar alguns minutos para ${habito.title.toLowerCase()} hoje? Não precisa ser perfeito, só começar já é ótimo.`,
    `Lembrete carinhoso: ${habito.title} pode fazer bem pra você hoje. Mas se não der, tudo bem também!`,
    `Ei! Pensei em você e no seu objetivo de ${habito.title.toLowerCase()}. Que tal tentar hoje, no seu tempo?`,
    `Sem pressão, mas ${habito.title.toLowerCase()} pode ser aquele momento de cuidado que você merece hoje.`,
  ];

  // Selecionar template aleatório
  const randomIndex = Math.floor(Math.random() * templates.length);
  return templates[randomIndex];
}

/**
 * Rastreia progresso de hábito
 *
 * @param user_id - ID da usuária
 * @param habito_id - ID do hábito
 * @returns Estatísticas de progresso
 *
 * @example
 * ```typescript
 * const progress = await trackProgresso("user_123", "habit_1");
 * // { streak: 3, completude: 60, last_completed: Date, total_completions: 15 }
 * ```
 */
export async function trackProgresso(user_id: string, habito_id: string): Promise<HabitProgress> {
  validateIds(user_id, habito_id);

  try {
    // Mock - na prática buscar do banco de dados
    const progressData = await fetchProgressFromDB(user_id, habito_id);

    return progressData;
  } catch (error) {
    throw new NathiaError('Erro ao rastrear progresso', 'TRACK_PROGRESS_ERROR', { error });
  }
}

/**
 * Registra completude de hábito
 *
 * @param user_id - ID da usuária
 * @param habito_id - ID do hábito
 * @returns Progresso atualizado
 */
export async function registrarCompletude(user_id: string, habito_id: string): Promise<HabitProgress> {
  validateIds(user_id, habito_id);

  try {
    // Buscar progresso atual
    const currentProgress = await trackProgresso(user_id, habito_id);

    // Calcular novo streak
    const newStreak = calculateNewStreak(currentProgress);

    // Atualizar progresso
    const updatedProgress: HabitProgress = {
      ...currentProgress,
      streak: newStreak,
      last_completed: new Date(),
      total_completions: currentProgress.total_completions + 1,
      completude: Math.min(currentProgress.completude + 5, 100), // +5% por completude
    };

    // Salvar no DB (mock)
    await saveProgressToDB(updatedProgress);

    return updatedProgress;
  } catch (error) {
    throw new NathiaError('Erro ao registrar completude', 'REGISTER_COMPLETION_ERROR', { error });
  }
}

/**
 * Sugere melhor horário para hábito baseado em padrões
 *
 * @param user_id - ID da usuária
 * @param habito - Hábito a ser agendado
 * @returns Sugestões de horário
 */
export async function sugerirHorario(user_id: string, habito: Habit): Promise<{ time: string; reason: string }[]> {
  // Heurísticas simples baseadas no tipo de hábito
  const suggestions: { time: string; reason: string }[] = [];

  const category = habito.category.toLowerCase();

  if (category.includes('mental') || category.includes('journal')) {
    suggestions.push(
      { time: '21:00', reason: 'Momento tranquilo antes de dormir' },
      { time: '07:00', reason: 'Começar o dia com clareza mental' }
    );
  } else if (category.includes('fisica') || category.includes('exercicio')) {
    suggestions.push({ time: '06:30', reason: 'Energia da manhã' }, { time: '10:00', reason: 'Após rotina matinal' });
  } else if (category.includes('autocuidado')) {
    suggestions.push(
      { time: '14:00', reason: 'Pausa no meio do dia' },
      { time: '20:00', reason: 'Momento de relaxamento noturno' }
    );
  } else {
    suggestions.push({ time: '09:00', reason: 'Início do dia' }, { time: '15:00', reason: 'Tarde' });
  }

  return suggestions;
}

/**
 * Identifica barreiras para completar hábito
 *
 * @param user_id - ID da usuária
 * @param habito_id - ID do hábito
 * @returns Lista de possíveis barreiras
 */
export async function identificarBarreiras(
  user_id: string,
  habito_id: string
): Promise<{ barrier: string; suggestion: string }[]> {
  const progress = await trackProgresso(user_id, habito_id);

  const barriers: { barrier: string; suggestion: string }[] = [];

  // Streak baixo = dificuldade de consistência
  if (progress.streak < 2 && progress.total_completions > 5) {
    barriers.push({
      barrier: 'Dificuldade de manter consistência',
      suggestion: 'Que tal escolher um horário fixo e criar um lembrete?',
    });
  }

  // Baixa completude geral
  if (progress.completude < 30) {
    barriers.push({
      barrier: 'Objetivo pode estar muito ambicioso',
      suggestion: 'Vamos simplificar? Comece com versões menores desse hábito.',
    });
  }

  // Última completude há muito tempo
  if (progress.last_completed && daysSince(progress.last_completed) > 7) {
    barriers.push({
      barrier: 'Hábito pode ter perdido prioridade',
      suggestion: 'Esse hábito ainda faz sentido pra você agora? Podemos ajustar.',
    });
  }

  return barriers;
}

// ============= Funções Auxiliares =============

function inferDifficulty(objetivo: string): 'easy' | 'medium' | 'hard' {
  const lowerGoal = objetivo.toLowerCase();

  // Palavras que indicam dificuldade
  const easyIndicators = ['começar', 'tentar', 'explorar', '5 minutos', 'pequeno'];
  const hardIndicators = ['transformar', 'completamente', 'sempre', 'todo dia', 'radical'];

  if (easyIndicators.some((indicator) => lowerGoal.includes(indicator))) {
    return 'easy';
  }

  if (hardIndicators.some((indicator) => lowerGoal.includes(indicator))) {
    return 'hard';
  }

  return 'medium';
}

function generatePracticalSteps(objetivo: string): string[] {
  // Heurística simples - IA refinaria isso
  const steps = [
    'Escolher um momento específico do dia',
    'Preparar o que for necessário com antecedência',
    'Começar pequeno, com 5-10 minutos',
  ];

  return steps;
}

function calculateRealisticDeadline(objetivo: string, difficulty: 'easy' | 'medium' | 'hard'): number {
  const baseDays = NATHIA_CONFIG.habitos.prazo_padrao_dias;

  switch (difficulty) {
    case 'easy':
      return baseDays;
    case 'medium':
      return baseDays + 7;
    case 'hard':
      return baseDays + 14;
  }
}

function generateMicroGoalTitle(objetivo: string): string {
  // Transformar objetivo em micro-objetivo
  if (objetivo.toLowerCase().includes('quero')) {
    return objetivo.replace(/quero/gi, 'Começar a').replace(/fazer/gi, 'fazendo');
  }

  return `Primeiros passos: ${objetivo.toLowerCase()}`;
}

function buildMicroObjetivoPrompt(objetivo: string): string {
  return `${SYSTEM_PROMPTS.HABITOS_MICRO}

Objetivo geral: "${objetivo}"

Crie um micro-objetivo alcançável com 3-5 passos concretos.`;
}

function generateCelebrationMessage(streak: number, total: number): string {
  const messages = [
    `${streak} dias seguidos! Você está construindo um hábito de verdade.`,
    `Olha só! ${streak} dias de consistência. Cada dia conta.`,
    `${streak} dias! Percebe como está ficando mais fácil?`,
    `Incrível! ${streak} dias mostrando que você é capaz.`,
  ];

  if (total >= 20) {
    messages.push(`${total} vezes que você priorizou esse objetivo. Isso é inspirador!`);
  }

  return messages[Math.floor(Math.random() * messages.length)];
}

function generateEncouragementMessage(completude: number): string {
  return `Você já está ${completude}% no caminho. Continue no seu ritmo, cada passo importa.`;
}

function generateGentleReminderMessage(): string {
  const messages = [
    'Sem pressão, mas lembrei de você hoje. Que tal retomar quando der?',
    'Tudo bem se você pausou. Começar de novo também é parte do processo.',
    'Seu objetivo ainda está aqui te esperando, sem julgamento. Volte quando quiser.',
    'Dias difíceis acontecem. O importante é não desistir de si mesma.',
  ];

  return messages[Math.floor(Math.random() * messages.length)];
}

function generateSupportiveMessage(): string {
  const messages = [
    'Você está indo bem. Continue cuidando de você.',
    'Cada pequeno passo te leva mais perto do que você quer.',
    'Orgulhe-se de estar tentando. Isso já é muito.',
    'Você merece esse tempo pra você.',
  ];

  return messages[Math.floor(Math.random() * messages.length)];
}

function calculateNewStreak(progress: HabitProgress): number {
  if (!progress.last_completed) return 1;

  const daysSinceLastCompletion = daysSince(progress.last_completed);

  // Se completou ontem ou hoje, incrementa streak
  if (daysSinceLastCompletion <= 1) {
    return progress.streak + 1;
  }

  // Se pulou um dia, reseta streak
  return 1;
}

function daysSince(date: Date): number {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

async function fetchProgressFromDB(user_id: string, habito_id: string): Promise<HabitProgress> {
  // Mock - na prática buscar do Supabase
  return {
    user_id,
    habito_id,
    streak: 3,
    completude: 45,
    last_completed: new Date(Date.now() - 24 * 60 * 60 * 1000), // Ontem
    total_completions: 12,
  };
}

async function saveProgressToDB(progress: HabitProgress): Promise<void> {
  // Mock - na prática salvar no Supabase
  logger.info('Saving progress:', progress);
}

function validateObjetivo(objetivo: string): void {
  if (!objetivo || typeof objetivo !== 'string') {
    throw new ValidationError('Objetivo é obrigatório e deve ser string');
  }

  if (objetivo.trim().length < 5) {
    throw new ValidationError('Objetivo muito curto (mínimo 5 caracteres)');
  }

  if (objetivo.length > 500) {
    throw new ValidationError('Objetivo muito longo (máximo 500 caracteres)');
  }
}

function validateIds(user_id: string, habito_id: string): void {
  if (!user_id || typeof user_id !== 'string') {
    throw new ValidationError('user_id é obrigatório e deve ser string');
  }

  if (!habito_id || typeof habito_id !== 'string') {
    throw new ValidationError('habito_id é obrigatório e deve ser string');
  }
}

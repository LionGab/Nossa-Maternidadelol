/**
 * Módulo NAT-IA Onboarding Inteligente
 * Análise de respostas e criação de starter packs personalizados
 */

import {
  OnboardingResponse,
  OnboardingAnalysis,
  UserProfile,
  StarterPack,
  GroupRecommendation,
  ContentRecommendation,
  ValidationError,
  NathiaError,
} from './types';
import { SYSTEM_PROMPTS } from './prompts';
import { NATHIA_CONFIG } from './config';

/**
 * Analisa respostas do onboarding e gera perfil da usuária
 *
 * @param respostas - Array de respostas do onboarding
 * @returns Análise com stage, concerns e perfil completo
 *
 * @example
 * ```typescript
 * const analise = await analisarRespostas([
 *   { question_id: "stage", answer: "Segundo trimestre", timestamp: new Date() },
 *   { question_id: "concerns", answer: "Saúde do bebê,Sono", timestamp: new Date() }
 * ]);
 * // { stage: "mid", concerns: ["saude_bebe", "sono"], perfil: {...}, confidence_score: 0.85 }
 * ```
 */
export async function analisarRespostas(respostas: OnboardingResponse[]): Promise<OnboardingAnalysis> {
  // Validação
  validateOnboardingResponses(respostas);

  try {
    // Extração estruturada de informações
    const stage = extractStage(respostas);
    const concerns = extractConcerns(respostas);
    const support = extractSupport(respostas);
    const goals = extractGoals(respostas);

    // Construir perfil
    const perfil: UserProfile = {
      stage,
      concerns,
      goals,
      interests: inferInterests(respostas),
      preferred_content_type: inferContentPreferences(respostas),
      risk_factors: identifyRiskFactors(respostas, support),
    };

    // Calcular confidence score
    const confidence_score = calculateConfidence(respostas);

    return {
      stage,
      concerns,
      perfil,
      confidence_score,
    };
  } catch (error) {
    throw new NathiaError('Erro ao analisar respostas do onboarding', 'ONBOARDING_ANALYSIS_ERROR', { error });
  }
}

/**
 * Gera starter pack personalizado baseado no perfil
 *
 * @param perfil - Perfil da usuária
 * @returns Starter pack com grupos, conteúdos e objetivo
 *
 * @example
 * ```typescript
 * const pack = await gerarStarterPack({
 *   stage: "mid",
 *   concerns: ["sono", "saude_bebe"],
 *   goals: ["entender_desenvolvimento"]
 * });
 * // { grupos: [...], conteudo: [...], objetivo: "...", welcome_message: "..." }
 * ```
 */
export async function gerarStarterPack(perfil: UserProfile): Promise<StarterPack> {
  validateProfile(perfil);

  try {
    // Selecionar grupos recomendados
    const grupos = await selecionarGrupos(perfil);

    // Selecionar conteúdos recomendados
    const conteudo = await selecionarConteudos(perfil);

    // Gerar objetivo principal
    const objetivo = gerarObjetivo(perfil);

    // Gerar mensagem de boas-vindas personalizada
    const welcome_message = gerarWelcomeMessage(perfil);

    return {
      grupos,
      conteudo,
      objetivo,
      welcome_message,
    };
  } catch (error) {
    throw new NathiaError('Erro ao gerar starter pack', 'STARTER_PACK_ERROR', { error });
  }
}

/**
 * Obtém perguntas essenciais do onboarding
 */
export function getOnboardingQuestions() {
  return NATHIA_CONFIG.onboarding.perguntas_essenciais;
}

/**
 * Valida se o onboarding está completo
 */
export function isOnboardingComplete(respostas: OnboardingResponse[]): boolean {
  const config = NATHIA_CONFIG.onboarding;
  const perguntasEssenciais = config.perguntas_essenciais;

  // Verificar se todas as perguntas essenciais foram respondidas
  const answeredIds = new Set(respostas.map((r) => r.question_id));

  const allAnswered = perguntasEssenciais.every((q) => answeredIds.has(q.id));

  // Verificar número mínimo de respostas
  return allAnswered && respostas.length >= config.min_respostas;
}

/**
 * Atualiza perfil com nova informação
 */
export function updateProfile(currentProfile: UserProfile, updates: Partial<UserProfile>): UserProfile {
  return {
    ...currentProfile,
    ...updates,
    // Merge arrays ao invés de substituir
    concerns: updates.concerns
      ? [...new Set([...(currentProfile.concerns || []), ...updates.concerns])]
      : currentProfile.concerns,
    interests: updates.interests
      ? [...new Set([...(currentProfile.interests || []), ...updates.interests])]
      : currentProfile.interests,
    goals: updates.goals ? [...new Set([...(currentProfile.goals || []), ...updates.goals])] : currentProfile.goals,
  };
}

// ============= Funções de Extração =============

function extractStage(respostas: OnboardingResponse[]): 'early' | 'mid' | 'late' | 'postpartum' | 'ttc' | 'other' {
  const stageResponse = respostas.find((r) => r.question_id === 'stage');
  if (!stageResponse) return 'other';

  const answer = stageResponse.answer.toLowerCase();

  if (answer.includes('tentando')) return 'ttc';
  if (answer.includes('primeiro')) return 'early';
  if (answer.includes('segundo')) return 'mid';
  if (answer.includes('terceiro')) return 'late';
  if (answer.includes('pós-parto') || answer.includes('3 meses')) return 'postpartum';
  if (answer.includes('experiente')) return 'other';

  return 'other';
}

function extractConcerns(respostas: OnboardingResponse[]): string[] {
  const concernsResponse = respostas.find((r) => r.question_id === 'concerns');
  if (!concernsResponse) return [];

  // Parse resposta (pode ser CSV ou array)
  const concerns = concernsResponse.answer
    .split(',')
    .map((c) => c.trim().toLowerCase())
    .map(normalizeConcern);

  return concerns;
}

function extractSupport(respostas: OnboardingResponse[]): string | null {
  const supportResponse = respostas.find((r) => r.question_id === 'support');
  return supportResponse?.answer || null;
}

function extractGoals(respostas: OnboardingResponse[]): string[] {
  const goalsResponse = respostas.find((r) => r.question_id === 'goals');
  if (!goalsResponse) return [];

  return goalsResponse.answer
    .split(',')
    .map((g) => g.trim().toLowerCase())
    .map(normalizeGoal);
}

function normalizeConcern(concern: string): string {
  const mapping: Record<string, string> = {
    'saúde do bebê': 'saude_bebe',
    'minha saúde física': 'saude_fisica',
    'minha saúde mental': 'saude_mental',
    amamentação: 'amamentacao',
    sono: 'sono',
    relacionamento: 'relacionamento',
    'voltar ao trabalho': 'trabalho',
    finanças: 'financas',
  };

  return mapping[concern] || concern.replace(/\s+/g, '_');
}

function normalizeGoal(goal: string): string {
  const mapping: Record<string, string> = {
    'entender melhor o que está acontecendo': 'entender_desenvolvimento',
    'cuidar da minha saúde mental': 'saude_mental',
    'conectar com outras mães': 'conexao_social',
    'aprender sobre desenvolvimento do bebê': 'aprender_desenvolvimento',
    'encontrar equilíbrio vida-maternidade': 'equilibrio',
    'fortalecer relacionamentos': 'relacionamentos',
  };

  return mapping[goal] || goal.replace(/\s+/g, '_');
}

// ============= Inferências =============

function inferInterests(respostas: OnboardingResponse[]): string[] {
  // Inferir interesses baseado em concerns e goals
  const concerns = extractConcerns(respostas);
  const goals = extractGoals(respostas);

  return [...new Set([...concerns, ...goals])];
}

function inferContentPreferences(respostas: OnboardingResponse[]): ('article' | 'video' | 'audio' | 'checklist')[] {
  // Por enquanto, retornar todos os tipos
  // Futuramente, pode-se adicionar pergunta específica sobre preferência
  return ['article', 'checklist', 'video', 'audio'];
}

function identifyRiskFactors(respostas: OnboardingResponse[], support: string | null): string[] {
  const riskFactors: string[] = [];

  // Apoio limitado
  if (support?.toLowerCase().includes('limitado') || support?.toLowerCase().includes('sozinha')) {
    riskFactors.push('apoio_limitado');
  }

  // Preocupação com saúde mental
  const concerns = extractConcerns(respostas);
  if (concerns.includes('saude_mental')) {
    riskFactors.push('preocupacao_saude_mental');
  }

  return riskFactors;
}

function calculateConfidence(respostas: OnboardingResponse[]): number {
  const config = NATHIA_CONFIG.onboarding;
  const totalQuestions = config.perguntas_essenciais.length;
  const answeredQuestions = respostas.length;

  // Base confidence: proporção de perguntas respondidas
  let confidence = answeredQuestions / totalQuestions;

  // Bonus por qualidade das respostas
  const detailedAnswers = respostas.filter((r) => r.answer.length > 20);
  confidence += (detailedAnswers.length / answeredQuestions) * 0.2;

  return Math.min(confidence, 1.0);
}

// ============= Geração de Starter Pack =============

async function selecionarGrupos(perfil: UserProfile): Promise<GroupRecommendation[]> {
  // Mock data - na prática, buscar do banco de dados
  const todosGrupos: GroupRecommendation[] = [
    {
      id: 'grupo_1',
      name: 'Mães de Primeira Viagem',
      description: 'Espaço acolhedor para quem está vivendo a maternidade pela primeira vez',
      match_score: 0,
      reason: '',
    },
    {
      id: 'grupo_2',
      name: 'Sono do Bebê',
      description: 'Dicas e apoio sobre sono infantil',
      match_score: 0,
      reason: '',
    },
    {
      id: 'grupo_3',
      name: 'Autocuidado Materno',
      description: 'Cuidando de quem cuida: saúde mental e física das mães',
      match_score: 0,
      reason: '',
    },
  ];

  // Calcular match score para cada grupo
  todosGrupos.forEach((grupo) => {
    grupo.match_score = calculateGroupMatch(grupo, perfil);
    grupo.reason = generateGroupReason(grupo, perfil);
  });

  // Ordenar por match score e retornar top 3
  return todosGrupos.sort((a, b) => b.match_score - a.match_score).slice(0, 3);
}

async function selecionarConteudos(perfil: UserProfile): Promise<ContentRecommendation[]> {
  // Mock data - na prática, buscar do banco de dados
  const todosConteudos: ContentRecommendation[] = [
    {
      id: 'content_1',
      title: 'Guia Completo: Segundo Trimestre',
      type: 'article',
      match_score: 0,
      reason: '',
      estimated_time: '10 min',
    },
    {
      id: 'content_2',
      title: 'Checklist: Preparando a Casa para o Bebê',
      type: 'checklist',
      match_score: 0,
      reason: '',
      estimated_time: '5 min',
    },
    {
      id: 'content_3',
      title: 'Respiração e Mindfulness para Gestantes',
      type: 'audio',
      match_score: 0,
      reason: '',
      estimated_time: '8 min',
    },
  ];

  // Calcular match score para cada conteúdo
  todosConteudos.forEach((conteudo) => {
    conteudo.match_score = calculateContentMatch(conteudo, perfil);
    conteudo.reason = generateContentReason(conteudo, perfil);
  });

  // Ordenar por match score e retornar top 5
  return todosConteudos.sort((a, b) => b.match_score - a.match_score).slice(0, 5);
}

function gerarObjetivo(perfil: UserProfile): string {
  const { stage, goals } = perfil;

  if (goals?.includes('entender_desenvolvimento')) {
    return 'Entender melhor o desenvolvimento do bebê e se preparar para cada fase';
  }

  if (goals?.includes('saude_mental')) {
    return 'Cuidar da sua saúde mental e bem-estar durante a maternidade';
  }

  if (goals?.includes('conexao_social')) {
    return 'Conectar com outras mães e construir sua rede de apoio';
  }

  // Default baseado em stage
  if (stage === 'early' || stage === 'mid' || stage === 'late') {
    return 'Viver uma gravidez saudável e se preparar para a chegada do bebê';
  }

  return 'Apoiar você em cada passo da sua jornada materna';
}

function gerarWelcomeMessage(perfil: UserProfile): string {
  const { stage } = perfil;

  const messages: Record<string, string> = {
    ttc: 'Que jornada especial você está começando! Estamos aqui para apoiar você em cada passo.',
    early:
      'Parabéns pelo início dessa jornada incrível! O primeiro trimestre pode ser intenso, mas você não está sozinha.',
    mid: 'Você está no auge da gravidez! Vamos tornar essa fase ainda mais especial e tranquila.',
    late: 'A reta final chegou! Vamos te ajudar a se preparar para conhecer seu bebê.',
    postpartum: 'Bem-vinda ao quarto trimestre! Essa fase é de adaptação e descobertas. Estamos aqui para apoiar você.',
    other: 'Que bom ter você aqui! Vamos juntas nessa jornada de maternidade.',
  };

  return messages[stage] || messages.other;
}

// ============= Matching Algorithms =============

function calculateGroupMatch(grupo: GroupRecommendation, perfil: UserProfile): number {
  let score = 0.5; // Base score

  // Match por concerns
  if (perfil.concerns?.some((c) => grupo.name.toLowerCase().includes(c))) {
    score += 0.3;
  }

  // Match por stage (grupos específicos para cada fase)
  if (perfil.stage === 'early' && grupo.name.includes('Primeira Viagem')) {
    score += 0.2;
  }

  return Math.min(score, 1.0);
}

function calculateContentMatch(conteudo: ContentRecommendation, perfil: UserProfile): number {
  let score = 0.5; // Base score

  // Match por stage
  if (perfil.stage && conteudo.title.toLowerCase().includes(perfil.stage)) {
    score += 0.3;
  }

  // Match por concerns
  if (perfil.concerns?.some((c) => conteudo.title.toLowerCase().includes(c))) {
    score += 0.2;
  }

  return Math.min(score, 1.0);
}

function generateGroupReason(grupo: GroupRecommendation, perfil: UserProfile): string {
  return `Este grupo é perfeito para você porque foca em ${grupo.name.toLowerCase()}, algo relevante para sua jornada atual.`;
}

function generateContentReason(conteudo: ContentRecommendation, perfil: UserProfile): string {
  return `Esse conteúdo vai te ajudar com ${conteudo.title.toLowerCase()}, um dos seus interesses.`;
}

// ============= Validações =============

function validateOnboardingResponses(respostas: OnboardingResponse[]): void {
  if (!Array.isArray(respostas) || respostas.length === 0) {
    throw new ValidationError('Respostas de onboarding são obrigatórias');
  }

  respostas.forEach((r, index) => {
    if (!r.question_id || !r.answer) {
      throw new ValidationError(`Resposta ${index} inválida: question_id e answer são obrigatórios`);
    }
  });
}

function validateProfile(perfil: UserProfile): void {
  if (!perfil || typeof perfil !== 'object') {
    throw new ValidationError('Perfil inválido');
  }
}

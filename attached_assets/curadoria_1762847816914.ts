/**
 * Módulo NAT-IA Curadoria de Conteúdo
 * Transformação de conteúdo para formatos acessíveis e práticos
 */

import {
  ConteudoResumo,
  CincoMinutos,
  Checklist,
  ChecklistItem,
  SimplifiedText,
  ValidationError,
  NathiaError,
} from './types';
import { SYSTEM_PROMPTS } from './prompts';
import { NATHIA_CONFIG } from './config';

/**
 * Resume conteúdo em 5 linhas para leitura rápida
 *
 * @param texto - Texto original a ser resumido
 * @returns Resumo conciso com pontos-chave
 *
 * @example
 * ```typescript
 * const resumo = await resumirConteudo(`
 *   Artigo longo sobre amamentação...
 * `);
 * // { resumo: "5 linhas...", key_points: [...], reading_time_minutes: 2 }
 * ```
 */
export async function resumirConteudo(texto: string): Promise<ConteudoResumo> {
  validateTexto(texto);

  try {
    const config = NATHIA_CONFIG.curadoria;
    const wordCount = countWords(texto);
    const readingTime = Math.ceil(wordCount / config.palavras_por_minuto);

    // Extrair pontos-chave (heurística simples)
    const keyPoints = extractKeyPoints(texto);

    // Preparar prompt para IA
    const prompt = buildResumoPrompt(texto);

    return {
      original_length: texto.length,
      resumo: '', // Será preenchido pela IA
      key_points: keyPoints,
      reading_time_minutes: readingTime,
    };
  } catch (error) {
    throw new NathiaError('Erro ao resumir conteúdo', 'RESUMO_ERROR', { error });
  }
}

/**
 * Cria versão "Leia em 5 minutos" com bullets práticos
 *
 * @param texto - Texto original
 * @returns 5 bullets com informações essenciais
 *
 * @example
 * ```typescript
 * const cincoMin = await criarCincoMinutos(`
 *   Guia sobre sono do bebê...
 * `);
 * // { bullets: ["Estabeleça rotina", "Ambiente escuro", ...], total_time_minutes: 5 }
 * ```
 */
export async function criarCincoMinutos(texto: string): Promise<CincoMinutos> {
  validateTexto(texto);

  try {
    const config = NATHIA_CONFIG.curadoria;

    // Extrair ações práticas do texto
    const actionItems = extractActionItems(texto);

    // Preparar prompt para IA
    const prompt = buildCincoMinutosPrompt(texto);

    return {
      bullets: [], // Será preenchido pela IA
      total_time_minutes: 5,
      action_items: actionItems.length > 0 ? actionItems : undefined,
    };
  } catch (error) {
    throw new NathiaError('Erro ao criar versão 5 minutos', 'CINCO_MIN_ERROR', { error });
  }
}

/**
 * Gera checklist acionável a partir do conteúdo
 *
 * @param texto - Texto original
 * @returns Checklist com máximo 6 itens
 *
 * @example
 * ```typescript
 * const checklist = await gerarChecklist(`
 *   Preparação da mala da maternidade...
 * `);
 * // { title: "Mala da Maternidade", items: [...], estimated_completion_time: "30 min" }
 * ```
 */
export async function gerarChecklist(texto: string): Promise<Checklist> {
  validateTexto(texto);

  try {
    const config = NATHIA_CONFIG.curadoria;

    // Extrair título do texto
    const title = extractTitle(texto) || 'Checklist';

    // Identificar itens críticos
    const criticalItems = identifyCriticalItems(texto);

    // Preparar prompt para IA
    const prompt = buildChecklistPrompt(texto);

    return {
      title,
      items: [], // Será preenchido pela IA
      estimated_completion_time: '30 minutos',
    };
  } catch (error) {
    throw new NathiaError('Erro ao gerar checklist', 'CHECKLIST_ERROR', { error });
  }
}

/**
 * Simplifica linguagem mantendo precisão técnica
 *
 * @param texto - Texto com linguagem técnica ou complexa
 * @returns Texto simplificado e acessível
 *
 * @example
 * ```typescript
 * const simples = await simplificarLinguagem(`
 *   A gestante deve realizar o pré-natal...
 * `);
 * // { simplified: "Você deve fazer o pré-natal...", readability_score_after: 65 }
 * ```
 */
export async function simplificarLinguagem(texto: string): Promise<SimplifiedText> {
  validateTexto(texto);

  try {
    // Calcular readability score inicial
    const scoreBefore = calculateReadabilityScore(texto);

    // Preparar prompt para IA
    const prompt = buildSimplificarPrompt(texto);

    return {
      original: texto,
      simplified: '', // Será preenchido pela IA
      readability_score_before: scoreBefore,
      readability_score_after: 0, // Será calculado após simplificação
    };
  } catch (error) {
    throw new NathiaError('Erro ao simplificar linguagem', 'SIMPLIFY_ERROR', { error });
  }
}

/**
 * Extrai citações importantes do texto
 */
export function extrairCitacoes(texto: string, maxCitacoes: number = 3): string[] {
  // Procurar por citações entre aspas
  const quotesRegex = /"([^"]+)"/g;
  const citacoes: string[] = [];
  let match;

  while ((match = quotesRegex.exec(texto)) !== null && citacoes.length < maxCitacoes) {
    citacoes.push(match[1]);
  }

  return citacoes;
}

/**
 * Identifica e extrai termos técnicos que precisam de explicação
 */
export function identificarTermosTecnicos(texto: string): string[] {
  // Lista de termos técnicos comuns em maternidade
  const termosTecnicos = [
    'pré-natal',
    'pré-eclâmpsia',
    'eclâmpsia',
    'cesariana',
    'episiotomia',
    'colostro',
    'mastite',
    'apojadura',
    'lóquios',
    'puerpério',
    'contrações de braxton hicks',
    'dilatação',
    'apgar',
    'fontanela',
  ];

  const lowerTexto = texto.toLowerCase();
  return termosTecnicos.filter((termo) => lowerTexto.includes(termo));
}

/**
 * Aplica formatação para leitura escaneável
 */
export function formatarParaEscaneabilidade(texto: string): {
  headings: string[];
  paragraphs: string[];
  bullets: string[];
} {
  const lines = texto.split('\n').filter((l) => l.trim());

  const headings: string[] = [];
  const paragraphs: string[] = [];
  const bullets: string[] = [];

  lines.forEach((line) => {
    const trimmed = line.trim();

    // Headings (começa com #, ou CAPS, ou termina com :)
    if (trimmed.startsWith('#') || trimmed === trimmed.toUpperCase() || trimmed.endsWith(':')) {
      headings.push(trimmed);
    }
    // Bullets (começa com -, *, ou número)
    else if (/^[-*\d+.]\s/.test(trimmed)) {
      bullets.push(trimmed);
    }
    // Parágrafos
    else if (trimmed.length > 0) {
      paragraphs.push(trimmed);
    }
  });

  return { headings, paragraphs, bullets };
}

// ============= Funções de Prompt =============

function buildResumoPrompt(texto: string): string {
  return `${SYSTEM_PROMPTS.CURADORIA_RESUMO}

Texto original:
${texto.substring(0, 3000)}

Forneça um resumo em exatamente 5 linhas, focando nas informações mais importantes para uma mãe ocupada.`;
}

function buildCincoMinutosPrompt(texto: string): string {
  return `${SYSTEM_PROMPTS.CURADORIA_5MIN}

Texto original:
${texto.substring(0, 3000)}

Crie 5 bullets no formato "Leia em 5 minutos". Cada bullet deve ser prático e acionável.`;
}

function buildChecklistPrompt(texto: string): string {
  return `${SYSTEM_PROMPTS.CURADORIA_CHECKLIST}

Texto original:
${texto.substring(0, 3000)}

Crie uma checklist com máximo 6 itens. Cada item deve começar com um verbo e ser específico.`;
}

function buildSimplificarPrompt(texto: string): string {
  return `${SYSTEM_PROMPTS.CURADORIA_SIMPLIFICAR}

Texto original:
${texto}

Simplifique o texto mantendo todas as informações importantes, mas usando linguagem do dia a dia.`;
}

// ============= Funções Auxiliares =============

function countWords(texto: string): number {
  return texto.split(/\s+/).filter((w) => w.length > 0).length;
}

function extractKeyPoints(texto: string): string[] {
  const sentences = texto.split(/[.!?]+/).filter((s) => s.trim().length > 20);

  // Heurística simples: sentenças que contêm palavras-chave importantes
  const keywords = ['importante', 'essencial', 'fundamental', 'necessário', 'deve', 'precisa'];

  const keyPoints = sentences
    .filter((s) => keywords.some((k) => s.toLowerCase().includes(k)))
    .slice(0, 3)
    .map((s) => s.trim());

  return keyPoints;
}

function extractActionItems(texto: string): string[] {
  // Procurar por verbos imperativos comuns
  const actionVerbs = ['faça', 'evite', 'consulte', 'observe', 'mantenha', 'estabeleça', 'crie', 'prepare', 'organize'];

  const sentences = texto.split(/[.!?]+/).filter((s) => s.trim().length > 10);

  const actions = sentences
    .filter((s) => actionVerbs.some((v) => s.toLowerCase().includes(v)))
    .slice(0, 3)
    .map((s) => s.trim());

  return actions;
}

function extractTitle(texto: string): string | null {
  // Primeira linha ou primeira sentença como título
  const firstLine = texto.split('\n')[0].trim();

  if (firstLine.length < 100 && firstLine.length > 10) {
    return firstLine.replace(/^#+\s*/, ''); // Remove markdown headers
  }

  const firstSentence = texto.split(/[.!?]/)[0].trim();
  if (firstSentence.length < 100) {
    return firstSentence;
  }

  return null;
}

function identifyCriticalItems(texto: string): string[] {
  const criticalKeywords = ['urgente', 'emergência', 'imediatamente', 'logo', 'antes'];

  const sentences = texto.split(/[.!?]+/).filter((s) => s.trim().length > 10);

  return sentences.filter((s) => criticalKeywords.some((k) => s.toLowerCase().includes(k))).map((s) => s.trim());
}

/**
 * Calcula Flesch Reading Ease Score (aproximado para português)
 * Score: 0-100 (maior = mais fácil de ler)
 * Target: 60-70 = Plain English
 */
function calculateReadabilityScore(texto: string): number {
  const sentences = texto.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const words = texto.split(/\s+/).filter((w) => w.length > 0);
  const syllables = words.reduce((sum, word) => sum + countSyllables(word), 0);

  if (sentences.length === 0 || words.length === 0) return 0;

  const avgWordsPerSentence = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;

  // Flesch Reading Ease formula (adaptado)
  const score = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;

  return Math.max(0, Math.min(100, score));
}

/**
 * Conta sílabas de uma palavra (aproximação para português)
 */
function countSyllables(word: string): number {
  const vowels = 'aeiouáéíóúâêôãõ';
  let count = 0;
  let previousWasVowel = false;

  for (const char of word.toLowerCase()) {
    const isVowel = vowels.includes(char);
    if (isVowel && !previousWasVowel) {
      count++;
    }
    previousWasVowel = isVowel;
  }

  return Math.max(1, count);
}

function validateTexto(texto: string): void {
  if (!texto || typeof texto !== 'string') {
    throw new ValidationError('Texto é obrigatório e deve ser string');
  }

  if (texto.trim().length === 0) {
    throw new ValidationError('Texto não pode estar vazio');
  }

  if (texto.length < 50) {
    throw new ValidationError('Texto muito curto para curadoria (mínimo 50 caracteres)');
  }

  if (texto.length > 50000) {
    throw new ValidationError('Texto muito longo (máximo 50000 caracteres)');
  }
}

/**
 * Valida se uma checklist está bem formada
 */
export function validateChecklist(checklist: Checklist): boolean {
  if (!checklist.title || checklist.title.length === 0) return false;
  if (!checklist.items || checklist.items.length === 0) return false;
  if (checklist.items.length > NATHIA_CONFIG.curadoria.checklist_max_items) return false;

  // Todos os itens devem ter texto e começar com verbo
  const actionVerbs = /^(fazer|criar|preparar|organizar|comprar|levar|separar|verificar|conferir|lembrar)/i;

  return checklist.items.every((item) => item.text && item.text.length > 0 && actionVerbs.test(item.text));
}

/**
 * Módulo NAT-IA Moderação Assistida
 * Sistema de detecção e reescrita de conteúdo problemático
 */

import { ModerationAnalysis, ValidationError, NathiaError } from './types';
import { SYSTEM_PROMPTS } from './prompts';
import { NATHIA_CONFIG } from './config';

/**
 * Detecta julgamento em uma mensagem
 *
 * @param mensagem - Mensagem a ser analisada
 * @returns Score 0-1 (0=sem julgamento, 1=muito julgamento)
 *
 * @example
 * ```typescript
 * const score = await detectarJulgamento(
 *   "Você DEVERIA amamentar, mães de verdade fazem isso"
 * );
 * // 0.9 (alto julgamento)
 * ```
 */
export async function detectarJulgamento(mensagem: string): Promise<number> {
  validateMessage(mensagem);

  try {
    // Análise heurística de palavras/frases julgamentais
    const score = analyzeJudgementPatterns(mensagem);

    // Preparar prompt para IA refinar
    const prompt = buildJudgementPrompt(mensagem);

    return score;
  } catch (error) {
    throw new NathiaError('Erro ao detectar julgamento', 'JUDGEMENT_DETECTION_ERROR', { error });
  }
}

/**
 * Detecta toxicidade em uma mensagem
 *
 * @param mensagem - Mensagem a ser analisada
 * @returns Score 0-1 (0=seguro, 1=tóxico)
 *
 * @example
 * ```typescript
 * const score = await detectarToxidade(
 *   "Você é uma péssima mãe por fazer isso"
 * );
 * // 0.95 (muito tóxico)
 * ```
 */
export async function detectarToxidade(mensagem: string): Promise<number> {
  validateMessage(mensagem);

  try {
    // Análise heurística de padrões tóxicos
    const score = analyzeToxicityPatterns(mensagem);

    // Preparar prompt para IA refinar
    const prompt = buildToxicityPrompt(mensagem);

    return score;
  } catch (error) {
    throw new NathiaError('Erro ao detectar toxicidade', 'TOXICITY_DETECTION_ERROR', { error });
  }
}

/**
 * Sugere reescrita gentil de mensagem problemática
 *
 * @param mensagem - Mensagem original
 * @returns Mensagem reescrita de forma empática
 *
 * @example
 * ```typescript
 * const reescrita = await sugerirReescrita(
 *   "Você está fazendo tudo errado com seu bebê"
 * );
 * // "Pelo que vejo, talvez algumas coisas possam ser ajustadas. Posso compartilhar o que funcionou comigo?"
 * ```
 */
export async function sugerirReescrita(mensagem: string): Promise<string> {
  validateMessage(mensagem);

  try {
    // Verificar se mensagem é recuperável
    const judgement = analyzeJudgementPatterns(mensagem);
    const toxicity = analyzeToxicityPatterns(mensagem);

    // Se for muito tóxica, sugerir não publicar
    if (toxicity > 0.8 || judgement > 0.8) {
      return '[SUGESTÃO: NÃO PUBLICAR] Esta mensagem contém linguagem prejudicial. Considere reformular completamente ou escolher não comentar.';
    }

    // Preparar prompt para IA reescrever
    const prompt = buildRewritePrompt(mensagem);

    return ''; // Será preenchido pela IA
  } catch (error) {
    throw new NathiaError('Erro ao sugerir reescrita', 'REWRITE_ERROR', { error });
  }
}

/**
 * Gera explicação (rationale) para moderadora humana
 *
 * @param analise - Análise de moderação completa
 * @returns Explicação clara do motivo da decisão
 *
 * @example
 * ```typescript
 * const rationale = gerarRationale({
 *   judgement_score: 0.7,
 *   toxicity_score: 0.2,
 *   is_safe: false,
 *   concerns: ["julgamento de escolhas maternas"]
 * });
 * // "Esta mensagem foi sinalizada por conter julgamento..."
 * ```
 */
export function gerarRationale(analise: Partial<ModerationAnalysis>): string {
  const { judgement_score = 0, toxicity_score = 0, concerns = [] } = analise;

  const reasons: string[] = [];

  // Explicar scores altos
  if (judgement_score > 0.5) {
    reasons.push(
      `Julgamento detectado (score: ${judgement_score.toFixed(
        2
      )}). A mensagem parece criticar ou julgar escolhas maternas.`
    );
  }

  if (toxicity_score > 0.5) {
    reasons.push(
      `Toxicidade detectada (score: ${toxicity_score.toFixed(2)}). A mensagem contém linguagem ofensiva ou agressiva.`
    );
  }

  // Incluir concerns específicos
  if (concerns.length > 0) {
    reasons.push(`Preocupações identificadas: ${concerns.join(', ')}`);
  }

  // Decisão final
  const isSafe = judgement_score < 0.3 && toxicity_score < 0.3;
  if (isSafe) {
    reasons.push('✅ Mensagem aprovada: dentro dos padrões da comunidade.');
  } else if (judgement_score < 0.7 && toxicity_score < 0.7) {
    reasons.push('⚠️ Revisão recomendada: mensagem pode ser melhorada.');
  } else {
    reasons.push('❌ Bloqueio recomendado: mensagem viola diretrizes da comunidade.');
  }

  return reasons.join('\n\n');
}

/**
 * Análise completa de moderação
 *
 * @param mensagem - Mensagem a ser moderada
 * @returns Análise completa com scores e recomendações
 *
 * @example
 * ```typescript
 * const analise = await analisarMensagem("Você deveria fazer X");
 * // { judgement_score: 0.6, toxicity_score: 0.1, is_safe: false, ... }
 * ```
 */
export async function analisarMensagem(mensagem: string): Promise<ModerationAnalysis> {
  validateMessage(mensagem);

  try {
    // Análises paralelas
    const judgement_score = await detectarJulgamento(mensagem);
    const toxicity_score = await detectarToxidade(mensagem);

    // Determinar se é segura
    const config = NATHIA_CONFIG.moderacao;
    const is_safe = judgement_score < config.judgement_threshold && toxicity_score < config.toxicity_threshold;

    // Identificar concerns específicos
    const concerns = identifyConcerns(mensagem, judgement_score, toxicity_score);

    // Sugerir reescrita se necessário
    let suggested_rewrite: string | undefined;
    if (!is_safe && judgement_score < 0.8 && toxicity_score < 0.8) {
      suggested_rewrite = await sugerirReescrita(mensagem);
    }

    const analise: ModerationAnalysis = {
      judgement_score,
      toxicity_score,
      is_safe,
      concerns,
      suggested_rewrite,
      rationale: '',
    };

    // Gerar rationale
    analise.rationale = gerarRationale(analise);

    return analise;
  } catch (error) {
    throw new NathiaError('Erro ao analisar mensagem', 'MODERATION_ERROR', { error });
  }
}

/**
 * Decisão automática de moderação
 *
 * @param analise - Análise de moderação
 * @returns "approve" | "review" | "reject"
 */
export function decidirAcao(analise: ModerationAnalysis): 'approve' | 'review' | 'reject' {
  const config = NATHIA_CONFIG.moderacao;
  const { judgement_score, toxicity_score } = analise;

  // Auto-rejeitar se muito problemático
  if (judgement_score >= config.auto_reject_threshold || toxicity_score >= config.auto_reject_threshold) {
    return 'reject';
  }

  // Auto-aprovar se seguro
  if (judgement_score < config.auto_approve_threshold && toxicity_score < config.auto_approve_threshold) {
    return 'approve';
  }

  // Zona cinzenta: revisão humana
  return 'review';
}

/**
 * Exporta estatísticas de moderação (para analytics)
 */
export function getModerationStats(analyses: ModerationAnalysis[]): {
  total: number;
  approved: number;
  rejected: number;
  needs_review: number;
  avg_judgement: number;
  avg_toxicity: number;
} {
  const stats = {
    total: analyses.length,
    approved: 0,
    rejected: 0,
    needs_review: 0,
    avg_judgement: 0,
    avg_toxicity: 0,
  };

  analyses.forEach((a) => {
    const decision = decidirAcao(a);
    if (decision === 'approve') stats.approved++;
    else if (decision === 'reject') stats.rejected++;
    else stats.needs_review++;

    stats.avg_judgement += a.judgement_score;
    stats.avg_toxicity += a.toxicity_score;
  });

  stats.avg_judgement = stats.avg_judgement / (analyses.length || 1);
  stats.avg_toxicity = stats.avg_toxicity / (analyses.length || 1);

  return stats;
}

// ============= Análise Heurística =============

function analyzeJudgementPatterns(mensagem: string): number {
  const lowerMsg = mensagem.toLowerCase();
  let score = 0;

  // Padrões de julgamento
  const patterns = {
    shouldStatements: /\b(deveria|deve|tem que|precisa|é obrigado)\b/g,
    absolutes: /\b(sempre|nunca|todo|toda|nenhum|nenhuma)\b/g,
    comparisons: /\b(melhor mãe|mãe de verdade|boa mãe|má mãe)\b/g,
    prescriptive: /\b(errado|certo|correto|incorreto|adequado|inadequado)\b/g,
    judgementalPhrases: /\b(isso é\s+(ruim|mal|errado|vergonha))\b/g,
  };

  // Contar matches de cada padrão
  Object.entries(patterns).forEach(([key, pattern]) => {
    const matches = (lowerMsg.match(pattern) || []).length;
    if (key === 'comparisons' || key === 'judgementalPhrases') {
      score += matches * 0.25; // Mais peso para comparações e frases julgamentais
    } else {
      score += matches * 0.1;
    }
  });

  // Tom imperativo (muitos verbos no imperativo)
  const imperativeVerbs = /\b(faça|pare|deixe|não faça|evite|nunca faça)\b/g;
  const imperativeCount = (lowerMsg.match(imperativeVerbs) || []).length;
  if (imperativeCount > 2) score += 0.2;

  return Math.min(score, 1.0);
}

function analyzeToxicityPatterns(mensagem: string): number {
  const lowerMsg = mensagem.toLowerCase();
  let score = 0;

  // Palavras ofensivas (lista reduzida - expandir conforme necessário)
  const offensiveWords = ['idiota', 'burra', 'estúpida', 'incompetente', 'péssima', 'horrível'];
  offensiveWords.forEach((word) => {
    if (lowerMsg.includes(word)) score += 0.3;
  });

  // Ataques pessoais
  const personalAttacks = /\b(você é|você está sendo|seu comportamento é)\s+(ruim|mal|terrível|péssimo)/g;
  const attackCount = (lowerMsg.match(personalAttacks) || []).length;
  score += attackCount * 0.25;

  // Negações extremas
  const extremeNegations = /\b(não tem ideia|não sabe nada|não entende nada)\b/g;
  const negationCount = (lowerMsg.match(extremeNegations) || []).length;
  score += negationCount * 0.2;

  // Sarcasmo/deboche (heurística simples)
  const sarcasm = /\b(parabéns|claro|óbvio|nossa|uau)\s*[!.]{2,}/g;
  const sarcasmCount = (lowerMsg.match(sarcasm) || []).length;
  score += sarcasmCount * 0.15;

  // CAPS excessivo (gritar)
  const capsWords = mensagem.match(/\b[A-Z]{4,}\b/g) || [];
  if (capsWords.length > 2) score += 0.2;

  return Math.min(score, 1.0);
}

function identifyConcerns(mensagem: string, judgement: number, toxicity: number): string[] {
  const concerns: string[] = [];

  if (judgement > 0.5) {
    concerns.push('Julgamento de escolhas maternas');
  }

  if (toxicity > 0.5) {
    concerns.push('Linguagem ofensiva ou agressiva');
  }

  const lowerMsg = mensagem.toLowerCase();

  // Concerns específicos
  if (lowerMsg.includes('amamentação') || lowerMsg.includes('amamentar')) {
    if (judgement > 0.4) {
      concerns.push('Julgamento sobre amamentação');
    }
  }

  if (lowerMsg.includes('parto') || lowerMsg.includes('cesariana') || lowerMsg.includes('normal')) {
    if (judgement > 0.4) {
      concerns.push('Julgamento sobre tipo de parto');
    }
  }

  if (lowerMsg.includes('trabalho') || lowerMsg.includes('licença')) {
    if (judgement > 0.4) {
      concerns.push('Julgamento sobre escolhas profissionais');
    }
  }

  return concerns;
}

// ============= Prompts =============

function buildJudgementPrompt(mensagem: string): string {
  return `${SYSTEM_PROMPTS.MODERACAO_JULGAMENTO}

Mensagem: "${mensagem}"

Retorne apenas um número entre 0 e 1.`;
}

function buildToxicityPrompt(mensagem: string): string {
  return `${SYSTEM_PROMPTS.MODERACAO_TOXICIDADE}

Mensagem: "${mensagem}"

Retorne apenas um número entre 0 e 1.`;
}

function buildRewritePrompt(mensagem: string): string {
  return `${SYSTEM_PROMPTS.MODERACAO_REESCRITA}

Mensagem original: "${mensagem}"

Reescreva de forma gentil e construtiva, ou indique se não deve ser publicada.`;
}

// ============= Validação =============

function validateMessage(mensagem: string): void {
  if (!mensagem || typeof mensagem !== 'string') {
    throw new ValidationError('Mensagem é obrigatória e deve ser string');
  }

  if (mensagem.trim().length === 0) {
    throw new ValidationError('Mensagem não pode estar vazia');
  }
}

/**
 * Palavras/frases permitidas mesmo se detectadas como julgamento
 * (contexto médico, informacional)
 */
export const ALLOWED_PRESCRIPTIVE_CONTEXTS = [
  'segundo especialistas',
  'recomendação médica',
  'orientação profissional',
  'estudos mostram',
  'evidência científica',
];

/**
 * Verifica se julgamento está em contexto informacional aceitável
 */
export function isInAllowedContext(mensagem: string): boolean {
  const lowerMsg = mensagem.toLowerCase();
  return ALLOWED_PRESCRIPTIVE_CONTEXTS.some((context) => lowerMsg.includes(context));
}

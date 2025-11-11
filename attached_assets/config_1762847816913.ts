/**
 * Configurações ajustáveis da NAT-IA
 * Centralize parâmetros que podem ser ajustados sem modificar código
 */

import { logger } from '@/utils/logger';

export const NATHIA_CONFIG = {
  /**
   * Configurações de triagem de risco
   */
  triagem: {
    // Palavras-chave de alto risco (requer intervenção imediata)
    keywords_risco_alto: [
      'quero morrer',
      'penso em suicídio',
      'não aguento mais viver',
      'vou fazer mal',
      'machucar o bebê',
      'acabar com tudo',
      'melhor não estar aqui',
      'não quero mais viver',
    ],

    // Palavras-chave de observação (requer monitoramento)
    keywords_observacao: [
      'muito triste',
      'choro o tempo todo',
      'não consigo parar de chorar',
      'exausta',
      'esgotada',
      'não consigo dormir',
      'sozinha',
      'ninguém me entende',
      'não sinto nada',
      'entorpecida',
      'não consigo cuidar',
      'pensamentos ruins',
      'medo de ficar sozinha com bebê',
    ],

    // Thresholds para classificação
    threshold_risco_alto: 0.7, // confidence >= 0.7 = risco alto
    threshold_observacao: 0.4, // confidence >= 0.4 = observação

    // Intensidade de sentimento que dispara alerta
    intensidade_alerta: 8, // 0-10 scale
  },

  /**
   * Configurações de onboarding
   */
  onboarding: {
    // Perguntas essenciais do onboarding
    perguntas_essenciais: [
      {
        id: 'stage',
        question: 'Em que momento você está?',
        options: [
          'Tentando engravidar',
          'Primeiro trimestre',
          'Segundo trimestre',
          'Terceiro trimestre',
          'Pós-parto (até 3 meses)',
          'Pós-parto (3-12 meses)',
          'Mãe experiente (mais de 1 ano)',
        ],
      },
      {
        id: 'concerns',
        question: 'Quais são suas principais preocupações?',
        multiple: true,
        options: [
          'Saúde do bebê',
          'Minha saúde física',
          'Minha saúde mental',
          'Amamentação',
          'Sono',
          'Relacionamento',
          'Voltar ao trabalho',
          'Finanças',
        ],
      },
      {
        id: 'support',
        question: 'Como é sua rede de apoio?',
        options: ['Tenho muito apoio', 'Tenho algum apoio', 'Apoio limitado', 'Me sinto sozinha'],
      },
      {
        id: 'goals',
        question: 'O que você mais quer conquistar agora?',
        multiple: true,
        options: [
          'Entender melhor o que está acontecendo',
          'Cuidar da minha saúde mental',
          'Conectar com outras mães',
          'Aprender sobre desenvolvimento do bebê',
          'Encontrar equilíbrio vida-maternidade',
          'Fortalecer relacionamentos',
        ],
      },
    ],

    // Número mínimo de perguntas respondidas
    min_respostas: 3,

    // Confidence mínimo para sugestões automáticas
    min_confidence: 0.6,
  },

  /**
   * Configurações de curadoria
   */
  curadoria: {
    // Tamanhos de resumo
    resumo_max_linhas: 5,
    cinco_minutos_bullets: 5,
    checklist_max_items: 6,

    // Readability targets (Flesch Reading Ease)
    readability_target: 60, // 60-70 = Plain English

    // Tempo estimado de leitura (palavras por minuto)
    palavras_por_minuto: 200,
  },

  /**
   * Configurações de moderação
   */
  moderacao: {
    // Thresholds para aprovação automática
    judgement_threshold: 0.3, // < 0.3 = ok
    toxicity_threshold: 0.3, // < 0.3 = ok

    // Se ambos os scores forem baixos, aprovação automática
    auto_approve_threshold: 0.2,

    // Se qualquer score for muito alto, rejeição automática
    auto_reject_threshold: 0.8,

    // Entre os thresholds: revisão humana
  },

  /**
   * Configurações de recomendações
   */
  recomendacoes: {
    // Número de itens a recomendar
    max_conteudos: 5,
    max_circulos: 3,
    max_habitos: 1, // Apenas 1 hábito por vez

    // Peso dos fatores no algoritmo
    pesos: {
      stage_match: 0.4,
      interest_match: 0.3,
      recent_activity: 0.2,
      trending: 0.1,
    },

    // Minimum match score para recomendar
    min_match_score: 0.5,
  },

  /**
   * Configurações de hábitos
   */
  habitos: {
    // Número de micro-objetivos por objetivo
    micro_objetivos_count: 3,

    // Prazo padrão para micro-objetivos (dias)
    prazo_padrao_dias: 7,

    // Frequência de lembretes gentis
    lembrete_dias: [1, 3, 7], // Enviar depois de X dias sem completar

    // Streak mínimo para celebração
    streak_celebracao: 3,
  },

  /**
   * Configurações de analytics
   */
  analytics: {
    // Período de retenção de dados anônimos
    retention_days: 90,

    // Batch size para processamento
    batch_size: 100,

    // Categorias padronizadas de temas
    temas_padronizados: [
      'gravidez',
      'parto',
      'amamentacao',
      'sono',
      'desenvolvimento',
      'saude_mental',
      'saude_fisica',
      'relacionamentos',
      'trabalho',
      'financas',
      'alimentacao',
      'atividade_fisica',
    ],
  },

  /**
   * Configurações de copys
   */
  copys: {
    // Limites de caracteres
    push_titulo_max: 40,
    push_corpo_max: 120,
    email_subject_max: 60,

    // Todos os copys gerados requerem revisão humana
    requires_human_review: true,

    // Emojis permitidos (com moderação)
    emojis_permitidos: ['💙', '🤱', '🌟', '💪', '🌸', '☀️', '🌙'],
  },

  /**
   * Configurações gerais
   */
  geral: {
    // Versão da NAT-IA
    version: '1.0.0',

    // Idioma padrão
    default_language: 'pt-BR',

    // Timeout para chamadas de IA (ms)
    ai_timeout: 30000,

    // Retry attempts para falhas transientes
    max_retries: 3,

    // Logging level
    log_level: 'info' as 'debug' | 'info' | 'warn' | 'error',
  },
};

/**
 * Validação de configuração
 * Garante que os valores estão em ranges válidos
 */
export function validateConfig(): boolean {
  const { triagem, moderacao, recomendacoes } = NATHIA_CONFIG;

  // Validar thresholds estão entre 0 e 1
  const thresholds = [
    triagem.threshold_risco_alto,
    triagem.threshold_observacao,
    moderacao.judgement_threshold,
    moderacao.toxicity_threshold,
    moderacao.auto_approve_threshold,
    moderacao.auto_reject_threshold,
  ];

  if (thresholds.some((t) => t < 0 || t > 1)) {
    logger.error('NATHIA_CONFIG: Thresholds devem estar entre 0 e 1');
    return false;
  }

  // Validar pesos de recomendação somam 1
  const pesos = Object.values(recomendacoes.pesos);
  const soma = pesos.reduce((a, b) => a + b, 0);
  if (Math.abs(soma - 1.0) > 0.01) {
    logger.error('NATHIA_CONFIG: Pesos de recomendação devem somar 1.0');
    return false;
  }

  return true;
}

/**
 * Helper para obter configuração específica
 */
export function getConfig<K extends keyof typeof NATHIA_CONFIG>(key: K): (typeof NATHIA_CONFIG)[K] {
  return NATHIA_CONFIG[key];
}

/**
 * Helper para atualizar configuração em runtime (use com cuidado!)
 */
export function updateConfig(path: string[], value: any): void {
  let obj: any = NATHIA_CONFIG;
  for (let i = 0; i < path.length - 1; i++) {
    obj = obj[path[i]];
  }
  obj[path[path.length - 1]] = value;

  // Revalidar
  if (!validateConfig()) {
    throw new Error('Configuração inválida após atualização');
  }
}

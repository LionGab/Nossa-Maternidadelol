/**
 * Módulo NAT-IA Copys Operacionais
 * Geração de textos para notificações, emails e marketing
 * IMPORTANTE: Todos os copys SEMPRE requerem revisão humana
 */

import { PushNotification, EmailContent, AppStoreCopy, ValidationError, NathiaError } from './types';
import { SYSTEM_PROMPTS } from './prompts';
import { NATHIA_CONFIG } from './config';

/**
 * Gera push notification personalizada
 *
 * @param contexto - Contexto da notificação (usuária, evento, etc)
 * @param tipo - Tipo de notificação
 * @returns Push notification pronta (SEMPRE requer revisão humana)
 *
 * @example
 * ```typescript
 * const push = await gerarPushNotification(
 *   { user_stage: "mid", event: "new_content" },
 *   "content_alert"
 * );
 * // {
 * //   titulo: "Novo conteúdo para você",
 * //   corpo: "Acabamos de publicar um artigo sobre...",
 * //   action: "open_content",
 * //   requires_human_review: true
 * // }
 * ```
 */
export async function gerarPushNotification(
  contexto: Record<string, any>,
  tipo: 'content_alert' | 'habit_reminder' | 'community_update' | 'milestone' | 'support'
): Promise<PushNotification> {
  validateContexto(contexto);

  try {
    // Gerar título e corpo baseado no tipo
    const { titulo, corpo, action } = generatePushContent(tipo, contexto);

    // Validar limites de caracteres
    validatePushLimits(titulo, corpo);

    // Preparar prompt para IA refinar
    const prompt = buildPushPrompt(contexto, tipo);

    return {
      titulo,
      corpo,
      action,
      requires_human_review: true, // SEMPRE true
    };
  } catch (error) {
    throw new NathiaError('Erro ao gerar push notification', 'PUSH_GENERATION_ERROR', { error });
  }
}

/**
 * Gera email personalizado
 *
 * @param template - Nome do template
 * @param dados - Dados para preencher o template
 * @returns Email completo (SEMPRE requer revisão humana)
 *
 * @example
 * ```typescript
 * const email = await gerarEmail("welcome", {
 *   user_name: "Maria",
 *   onboarding_data: {...}
 * });
 * // {
 * //   subject: "Bem-vinda à Nossa Maternidade!",
 * //   html: "<html>...",
 * //   text: "versão texto...",
 * //   requires_human_review: true
 * // }
 * ```
 */
export async function gerarEmail(
  template: 'welcome' | 'weekly_digest' | 'habit_check_in' | 'milestone_celebration' | 're_engagement',
  dados: Record<string, any>
): Promise<EmailContent> {
  validateDados(dados);

  try {
    // Gerar conteúdo do email
    const { subject, html, text } = generateEmailContent(template, dados);

    // Validar subject length
    validateEmailSubject(subject);

    // Preparar prompt para IA refinar
    const prompt = buildEmailPrompt(template, dados);

    return {
      subject,
      html,
      text,
      requires_human_review: true, // SEMPRE true
    };
  } catch (error) {
    throw new NathiaError('Erro ao gerar email', 'EMAIL_GENERATION_ERROR', { error });
  }
}

/**
 * Gera copy para App Store / Google Play
 *
 * @param feature - Feature a ser destacada
 * @returns Copy completo para loja (SEMPRE requer revisão humana)
 *
 * @example
 * ```typescript
 * const copy = await gerarAppStoreCopy("nathia_chat");
 * // {
 * //   titulo: "NAT-IA: Sua Assistente Empática",
 * //   descricao: "Converse com NAT-IA, nossa assistente...",
 * //   keywords: ["maternidade", "suporte", "comunidade"],
 * //   requires_human_review: true
 * // }
 * ```
 */
export async function gerarAppStoreCopy(
  feature: 'nathia_chat' | 'circles' | 'content_library' | 'habits' | 'overall'
): Promise<AppStoreCopy> {
  try {
    // Gerar copy baseado na feature
    const { titulo, descricao, keywords, screenshots_suggestions } = generateAppStoreContent(feature);

    // Preparar prompt para IA refinar
    const prompt = buildAppStorePrompt(feature);

    return {
      titulo,
      descricao,
      keywords,
      screenshots_suggestions,
      requires_human_review: true, // SEMPRE true
    };
  } catch (error) {
    throw new NathiaError('Erro ao gerar App Store copy', 'APP_STORE_COPY_ERROR', { error });
  }
}

/**
 * Gera microcopy para UI
 *
 * @param elemento - Elemento da UI
 * @param contexto - Contexto do elemento
 * @returns Microcopy sugerido
 *
 * @example
 * ```typescript
 * const copy = gerarMicrocopy("empty_state", { section: "circles" });
 * // "Você ainda não entrou em nenhum círculo. Que tal conhecer nossa comunidade?"
 * ```
 */
export function gerarMicrocopy(
  elemento: 'empty_state' | 'error' | 'success' | 'loading' | 'button' | 'placeholder',
  contexto: Record<string, any>
): string {
  const section = contexto.section || 'geral';

  switch (elemento) {
    case 'empty_state':
      return getEmptyStateMessage(section);
    case 'error':
      return getErrorMessage(contexto.error_type || 'generic');
    case 'success':
      return getSuccessMessage(contexto.action || 'generic');
    case 'loading':
      return getLoadingMessage(section);
    case 'button':
      return getButtonLabel(contexto.action || 'submit');
    case 'placeholder':
      return getPlaceholderText(contexto.field || 'generic');
  }
}

/**
 * Gera linha de assunto para email A/B testing
 *
 * @param template - Template do email
 * @param variante - Variante (A ou B)
 * @returns Linha de assunto otimizada
 */
export function gerarSubjectLineVariante(
  template: string,
  variante: 'A' | 'B'
): { subject: string; hypothesis: string } {
  const variants = {
    welcome: {
      A: {
        subject: 'Bem-vinda! Vamos começar sua jornada',
        hypothesis: 'Tom caloroso e inclusivo',
      },
      B: {
        subject: 'Sua comunidade de mães te espera',
        hypothesis: 'Foco em comunidade e pertencimento',
      },
    },
    weekly_digest: {
      A: {
        subject: 'Sua semana na Nossa Maternidade',
        hypothesis: 'Personalização e recapitulação',
      },
      B: {
        subject: '5 conteúdos que você não pode perder',
        hypothesis: 'Curiosidade e valor numérico',
      },
    },
  };

  return (
    variants[template as keyof typeof variants]?.[variante] || {
      subject: 'Nossa Maternidade',
      hypothesis: 'Genérico',
    }
  );
}

/**
 * Valida copy contra diretrizes da marca
 *
 * @param copy - Copy a ser validado
 * @returns Validação com sugestões
 */
export function validarCopyBrand(copy: string): {
  valid: boolean;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];

  // Verificar tom julgamental
  if (/deveria|deve|tem que/i.test(copy)) {
    issues.push('Tom prescritivo/julgamental detectado');
    suggestions.push('Use "pode", "uma opção é", "algumas mães escolhem"');
  }

  // Verificar comparações
  if (/melhor mãe|mãe de verdade|boa mãe/i.test(copy)) {
    issues.push('Linguagem comparativa/julgamental');
    suggestions.push('Remova comparações entre mães');
  }

  // Verificar alarmismo
  if (/urgente|cuidado|perigo|nunca/i.test(copy)) {
    issues.push('Tom alarmista detectado');
    suggestions.push('Use linguagem informativa, não alarmista');
  }

  // Verificar emojis excessivos
  const emojiCount = (copy.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length;
  if (emojiCount > 2) {
    issues.push('Uso excessivo de emojis');
    suggestions.push(`Limite a ${NATHIA_CONFIG.copys.emojis_permitidos.length} emojis relevantes`);
  }

  // Verificar tamanho de frases
  const sentences = copy.split(/[.!?]+/);
  const longSentences = sentences.filter((s) => s.split(/\s+/).length > 25);
  if (longSentences.length > 0) {
    issues.push('Frases muito longas detectadas');
    suggestions.push('Quebre frases com mais de 20 palavras');
  }

  return {
    valid: issues.length === 0,
    issues,
    suggestions,
  };
}

// ============= Content Generation =============

function generatePushContent(
  tipo: string,
  contexto: Record<string, any>
): { titulo: string; corpo: string; action?: string } {
  const config = NATHIA_CONFIG.copys;

  switch (tipo) {
    case 'content_alert':
      return {
        titulo: 'Novo conteúdo para você 🌟',
        corpo: 'Acabamos de publicar algo que pode te ajudar agora',
        action: 'open_content',
      };

    case 'habit_reminder':
      return {
        titulo: 'Lembrete gentil',
        corpo: 'Que tal reservar um momento para você hoje?',
        action: 'open_habits',
      };

    case 'community_update':
      return {
        titulo: 'Novidades na comunidade',
        corpo: 'Outras mães estão compartilhando experiências incríveis',
        action: 'open_circles',
      };

    case 'milestone':
      return {
        titulo: 'Você conquistou algo especial!',
        corpo: 'Veja seu progresso e celebre com a gente',
        action: 'open_profile',
      };

    case 'support':
      return {
        titulo: 'Estamos aqui por você',
        corpo: 'Se precisar de apoio, nossa comunidade está pronta para acolher',
        action: 'open_support',
      };

    default:
      return {
        titulo: 'Nossa Maternidade',
        corpo: 'Temos novidades para você',
      };
  }
}

function generateEmailContent(
  template: string,
  dados: Record<string, any>
): { subject: string; html: string; text: string } {
  switch (template) {
    case 'welcome':
      return {
        subject: 'Bem-vinda à Nossa Maternidade!',
        html: generateWelcomeEmailHTML(dados),
        text: generateWelcomeEmailText(dados),
      };

    case 'weekly_digest':
      return {
        subject: 'Sua semana na Nossa Maternidade',
        html: generateDigestEmailHTML(dados),
        text: generateDigestEmailText(dados),
      };

    case 'habit_check_in':
      return {
        subject: 'Como está indo seu objetivo?',
        html: generateHabitCheckInHTML(dados),
        text: generateHabitCheckInText(dados),
      };

    case 'milestone_celebration':
      return {
        subject: 'Parabéns pela sua conquista!',
        html: generateMilestoneEmailHTML(dados),
        text: generateMilestoneEmailText(dados),
      };

    case 're_engagement':
      return {
        subject: 'Sentimos sua falta',
        html: generateReEngagementHTML(dados),
        text: generateReEngagementText(dados),
      };

    default:
      return {
        subject: 'Nossa Maternidade',
        html: '<p>Email em construção</p>',
        text: 'Email em construção',
      };
  }
}

function generateAppStoreContent(feature: string): {
  titulo: string;
  descricao: string;
  keywords: string[];
  screenshots_suggestions: string[];
} {
  const baseKeywords = ['maternidade', 'gravidez', 'pós-parto', 'mães', 'comunidade', 'suporte', 'bem-estar'];

  switch (feature) {
    case 'nathia_chat':
      return {
        titulo: 'NAT-IA: Assistente Empática',
        descricao:
          'Converse com NAT-IA, sua assistente de IA especializada em maternidade. Tire dúvidas, encontre apoio e receba orientações personalizadas 24/7, sempre com empatia e sem julgamento.',
        keywords: [...baseKeywords, 'chat', 'assistente', 'IA', 'suporte emocional'],
        screenshots_suggestions: [
          'Conversa com NAT-IA mostrando resposta empática',
          'Detecção de preocupações e sugestões de recursos',
        ],
      };

    case 'circles':
      return {
        titulo: 'Círculos de Apoio',
        descricao:
          'Conecte-se com outras mães em círculos temáticos. Compartilhe experiências, tire dúvidas e construa sua rede de apoio em um ambiente seguro e acolhedor.',
        keywords: [...baseKeywords, 'grupos', 'círculos', 'conexão', 'amizade'],
        screenshots_suggestions: ['Lista de círculos disponíveis', 'Conversa em círculo temático'],
      };

    case 'overall':
      return {
        titulo: 'Nossa Maternidade - Comunidade de Mães',
        descricao:
          'O app completo para sua jornada materna. Chat com assistente de IA, círculos de apoio, conteúdos especializados e ferramentas para seu bem-estar. Maternidade real, sem julgamentos.',
        keywords: baseKeywords,
        screenshots_suggestions: [
          'Home com todas as funcionalidades',
          'Chat com NAT-IA',
          'Círculos de apoio',
          'Biblioteca de conteúdo',
        ],
      };

    default:
      return {
        titulo: 'Nossa Maternidade',
        descricao: 'Sua comunidade de apoio na maternidade',
        keywords: baseKeywords,
        screenshots_suggestions: [],
      };
  }
}

// ============= Email Templates =============

function generateWelcomeEmailHTML(dados: Record<string, any>): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #E91E63;">Bem-vinda à Nossa Maternidade!</h1>
    <p>Estamos muito felizes em ter você aqui.</p>
    <p>Nossa comunidade é um espaço seguro e acolhedor onde você pode:</p>
    <ul>
      <li>Conversar com NAT-IA, sua assistente empática</li>
      <li>Conectar com outras mães em círculos de apoio</li>
      <li>Acessar conteúdos especializados</li>
      <li>Cuidar do seu bem-estar</li>
    </ul>
    <p>Vamos começar?</p>
    <a href="[APP_LINK]" style="display: inline-block; padding: 12px 24px; background: #E91E63; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">Explorar o app</a>
    <p style="color: #666; font-size: 14px; margin-top: 40px;">Com carinho,<br>Equipe Nossa Maternidade</p>
  </div>
</body>
</html>
  `.trim();
}

function generateWelcomeEmailText(dados: Record<string, any>): string {
  return `
Bem-vinda à Nossa Maternidade!

Estamos muito felizes em ter você aqui.

Nossa comunidade é um espaço seguro e acolhedor onde você pode:
- Conversar com NAT-IA, sua assistente empática
- Conectar com outras mães em círculos de apoio
- Acessar conteúdos especializados
- Cuidar do seu bem-estar

Vamos começar? Abra o app e explore tudo que preparamos para você.

Com carinho,
Equipe Nossa Maternidade
  `.trim();
}

function generateDigestEmailHTML(dados: Record<string, any>): string {
  return '<html><body><p>Weekly digest HTML</p></body></html>';
}

function generateDigestEmailText(dados: Record<string, any>): string {
  return 'Weekly digest text version';
}

function generateHabitCheckInHTML(dados: Record<string, any>): string {
  return '<html><body><p>Habit check-in HTML</p></body></html>';
}

function generateHabitCheckInText(dados: Record<string, any>): string {
  return 'Habit check-in text version';
}

function generateMilestoneEmailHTML(dados: Record<string, any>): string {
  return '<html><body><p>Milestone celebration HTML</p></body></html>';
}

function generateMilestoneEmailText(dados: Record<string, any>): string {
  return 'Milestone celebration text version';
}

function generateReEngagementHTML(dados: Record<string, any>): string {
  return '<html><body><p>Re-engagement HTML</p></body></html>';
}

function generateReEngagementText(dados: Record<string, any>): string {
  return 'Re-engagement text version';
}

// ============= Microcopy Functions =============

function getEmptyStateMessage(section: string): string {
  const messages: Record<string, string> = {
    circles: 'Você ainda não entrou em nenhum círculo. Que tal conhecer nossa comunidade?',
    habits: 'Nenhum hábito criado ainda. Vamos começar com algo pequeno?',
    content: 'Explore nossa biblioteca de conteúdos especializados.',
  };
  return messages[section] || 'Nada para exibir ainda.';
}

function getErrorMessage(errorType: string): string {
  const messages: Record<string, string> = {
    network: 'Ops! Verifique sua conexão e tente novamente.',
    generic: 'Algo não saiu como esperado. Tente novamente em instantes.',
    validation: 'Por favor, verifique os dados e tente novamente.',
  };
  return messages[errorType] || messages.generic;
}

function getSuccessMessage(action: string): string {
  const messages: Record<string, string> = {
    saved: 'Salvo com sucesso!',
    sent: 'Enviado!',
    updated: 'Atualizado!',
  };
  return messages[action] || 'Concluído!';
}

function getLoadingMessage(section: string): string {
  return 'Carregando...';
}

function getButtonLabel(action: string): string {
  const labels: Record<string, string> = {
    submit: 'Enviar',
    save: 'Salvar',
    continue: 'Continuar',
    cancel: 'Cancelar',
    delete: 'Excluir',
  };
  return labels[action] || 'OK';
}

function getPlaceholderText(field: string): string {
  const placeholders: Record<string, string> = {
    message: 'Digite sua mensagem...',
    search: 'Buscar...',
    email: 'Seu email',
  };
  return placeholders[field] || '';
}

// ============= Prompts =============

function buildPushPrompt(contexto: Record<string, any>, tipo: string): string {
  return `${SYSTEM_PROMPTS.COPYS_PUSH}

Contexto: ${JSON.stringify(contexto)}
Tipo: ${tipo}

Gere uma push notification empática e relevante.`;
}

function buildEmailPrompt(template: string, dados: Record<string, any>): string {
  return `${SYSTEM_PROMPTS.COPYS_EMAIL}

Template: ${template}
Dados: ${JSON.stringify(dados)}

Gere um email completo e personalizado.`;
}

function buildAppStorePrompt(feature: string): string {
  return `Gere copy para App Store destacando: ${feature}

Foque em benefícios emocionais e práticos para mães.`;
}

// ============= Validação =============

function validateContexto(contexto: Record<string, any>): void {
  if (!contexto || typeof contexto !== 'object') {
    throw new ValidationError('Contexto é obrigatório e deve ser objeto');
  }
}

function validateDados(dados: Record<string, any>): void {
  if (!dados || typeof dados !== 'object') {
    throw new ValidationError('Dados são obrigatórios e devem ser objeto');
  }
}

function validatePushLimits(titulo: string, corpo: string): void {
  const config = NATHIA_CONFIG.copys;

  if (titulo.length > config.push_titulo_max) {
    throw new ValidationError(`Título muito longo: ${titulo.length}/${config.push_titulo_max} caracteres`);
  }

  if (corpo.length > config.push_corpo_max) {
    throw new ValidationError(`Corpo muito longo: ${corpo.length}/${config.push_corpo_max} caracteres`);
  }
}

function validateEmailSubject(subject: string): void {
  const config = NATHIA_CONFIG.copys;

  if (subject.length > config.email_subject_max) {
    throw new ValidationError(`Subject muito longo: ${subject.length}/${config.email_subject_max} caracteres`);
  }
}

/**
 * Sanitização de conteúdo para prevenir XSS
 * Remove HTML/JavaScript malicioso mas mantém formatação básica segura
 */
import sanitizeHtml from 'sanitize-html';

const ALLOWED_TAGS = ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'];
const ALLOWED_ATTRIBUTES = {};

export function sanitizeContent(content: string): string {
  return sanitizeHtml(content, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    // Remove todos os scripts e eventos
    disallowedTagsMode: 'discard',
    // Remove atributos de estilo inline
    allowedStyles: {},
    // Texto puro se não houver tags permitidas
    textContent: true,
  });
}

/**
 * Sanitiza conteúdo de posts da comunidade
 */
export function sanitizePostContent(content: string): string {
  return sanitizeContent(content);
}

/**
 * Sanitiza conteúdo de comentários
 */
export function sanitizeCommentContent(content: string): string {
  return sanitizeContent(content);
}

/**
 * Sanitiza mensagens de IA (mais restritivo)
 */
export function sanitizeAiMessage(content: string): string {
  // Apenas texto puro para mensagens de IA
  return sanitizeHtml(content, {
    allowedTags: [],
    allowedAttributes: {},
    textContent: true,
  });
}


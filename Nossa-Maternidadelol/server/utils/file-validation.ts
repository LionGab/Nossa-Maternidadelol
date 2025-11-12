/**
 * Validação robusta de arquivos usando magic bytes (MIME type real)
 * Previne upload de arquivos maliciosos disfarçados
 */
import { fileTypeFromBuffer } from 'file-type';

// Tamanhos máximos em bytes
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB para imagens

// MIME types permitidos
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];

export const ALLOWED_FILE_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  'application/pdf',
  'text/plain',
];

/**
 * Valida tamanho do arquivo ANTES de processar
 */
export function validateFileSize(size: number, maxSize: number = MAX_FILE_SIZE): boolean {
  return size <= maxSize;
}

/**
 * Valida MIME type real usando magic bytes
 * Retorna o MIME type detectado ou null se inválido
 */
export async function validateMimeType(
  buffer: Buffer,
  allowedTypes: string[] = ALLOWED_IMAGE_TYPES
): Promise<{ valid: boolean; mimeType: string | null }> {
  try {
    const fileType = await fileTypeFromBuffer(buffer);
    
    if (!fileType) {
      return { valid: false, mimeType: null };
    }

    const isValid = allowedTypes.includes(fileType.mime);
    return {
      valid: isValid,
      mimeType: fileType.mime,
    };
  } catch (error) {
    console.error('Erro ao validar MIME type:', error);
    return { valid: false, mimeType: null };
  }
}

/**
 * Valida se é realmente uma imagem (para uploads de imagem)
 */
export async function validateImageFile(buffer: Buffer): Promise<{ valid: boolean; mimeType: string | null }> {
  return validateMimeType(buffer, ALLOWED_IMAGE_TYPES);
}

/**
 * Valida extensão do arquivo (validação secundária)
 */
export function validateFileExtension(
  filename: string,
  allowedExtensions: string[] = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
): boolean {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return allowedExtensions.includes(ext);
}

/**
 * Valida tamanho de string base64 ANTES de decodificar
 * Base64 é ~33% maior que binário, então validamos o tamanho do string
 */
export function validateBase64Size(base64String: string, maxSizeBytes: number = MAX_FILE_SIZE): boolean {
  // Remove data URL prefix se existir
  const base64Data = base64String.includes(',') 
    ? base64String.split(',')[1] 
    : base64String;
  
  // Tamanho aproximado do binário = tamanho base64 * 0.75
  // Mas validamos o tamanho do base64 string diretamente
  // maxSizeBytes * 1.33 para dar margem
  const maxBase64Size = Math.ceil(maxSizeBytes * 1.34); // Margem de segurança
  
  return base64Data.length <= maxBase64Size;
}


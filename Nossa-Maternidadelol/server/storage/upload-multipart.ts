/**
 * Upload de arquivos usando multipart/form-data (mais eficiente que base64)
 * Inclui compressão de imagens, validação robusta e cleanup automático
 * Otimizado para Supabase Pro
 */
import multer from 'multer';
import type { Request } from 'express';
// @ts-ignore - sharp não tem tipos, mas funciona
import sharp from 'sharp';
import { validateImageFile, validateFileSize, MAX_IMAGE_SIZE } from '../utils/file-validation.js';
import { retryUpload } from '../utils/retry.js';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
  {
    // Otimizações para Supabase Pro
    auth: {
      persistSession: false, // Não precisamos de sessão no servidor
    },
  }
);

// Configuração do multer (armazenamento em memória)
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: MAX_IMAGE_SIZE,
  },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, acceptFile: boolean) => void) => {
    // Validação básica de extensão
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const ext = file.originalname.toLowerCase().substring(
      file.originalname.lastIndexOf('.')
    );
    
    if (!allowedExtensions.includes(ext)) {
      return cb(new Error('Tipo de arquivo não permitido'), false);
    }
    
    cb(null, true);
  },
});

/**
 * Comprime imagem usando sharp (reduz 70-80% do tamanho)
 * Mantém formato original quando possível
 * Otimizado para Supabase Pro (CDN faz transformações adicionais)
 */
async function compressImage(
  buffer: Buffer, 
  mimeType: string,
  quality: number = 80
): Promise<Buffer> {
  try {
    let sharpInstance = sharp(buffer)
      .resize(1920, 1920, { 
        fit: 'inside',
        withoutEnlargement: true 
      });

    // Manter formato original quando possível
    // Supabase Pro CDN pode fazer conversão automática para WebP
    if (mimeType === 'image/png') {
      sharpInstance = sharpInstance.png({ 
        quality, 
        compressionLevel: 9,
        progressive: true 
      });
    } else if (mimeType === 'image/webp') {
      sharpInstance = sharpInstance.webp({ 
        quality,
        effort: 6 // Melhor compressão
      });
    } else {
      // JPEG para outros formatos
      sharpInstance = sharpInstance.jpeg({ 
        quality, 
        mozjpeg: true,
        progressive: true 
      });
    }

    return await sharpInstance.toBuffer();
  } catch (error) {
    console.error('Erro ao comprimir imagem:', error);
    throw error;
  }
}

/**
 * Faz upload de imagem com validação, compressão e retry
 * Otimizado para Supabase Pro com CDN
 */
export async function uploadImage(
  file: Express.Multer.File,
  folder: string = 'uploads'
): Promise<{ url: string; path: string }> {
  // 1. Validar tamanho ANTES de processar
  if (!validateFileSize(file.size, MAX_IMAGE_SIZE)) {
    throw new Error('Arquivo muito grande');
  }

  // 2. Validar MIME type real usando magic bytes
  const mimeValidation = await validateImageFile(file.buffer);
  if (!mimeValidation.valid || !mimeValidation.mimeType) {
    throw new Error('Arquivo não é uma imagem válida');
  }

  // 3. Comprimir imagem
  const compressedBuffer = await compressImage(
    file.buffer, 
    mimeValidation.mimeType!
  );

  // 4. Gerar nome único
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 15);
  const ext = mimeValidation.mimeType.split('/')[1] || 'jpg';
  const fileName = `${timestamp}-${randomStr}.${ext}`;
  const filePath = `${folder}/${fileName}`;

  // 5. Upload com retry
  const result = await retryUpload(async () => {
    const uploadResult = await supabase.storage
      .from('files')
      .upload(filePath, compressedBuffer, {
        contentType: mimeValidation.mimeType!,
        upsert: false,
      });
    
    if (uploadResult.error) throw uploadResult.error;
    return uploadResult;
  });

  // 6. Obter URL pública (Supabase Pro usa CDN automático)
  const { data: urlData } = supabase.storage
    .from('files')
    .getPublicUrl(filePath, {
      // Supabase Pro: transformações de imagem via CDN
      // Nota: transformações são feitas via query params na URL, não aqui
      // O CDN do Supabase Pro faz otimização automática
    });

  return {
    url: urlData.publicUrl,
    path: filePath,
  };
}

/**
 * Deleta arquivo do storage
 */
export async function deleteFile(filePath: string): Promise<void> {
  try {
    await retryUpload(async () => {
      const { error } = await supabase.storage
        .from('files')
        .remove([filePath]);
      
      if (error) throw error;
    });
  } catch (error) {
    console.error(`Erro ao deletar arquivo ${filePath}:`, error);
    // Não lança erro para não quebrar o fluxo principal
  }
}

/**
 * Deleta múltiplos arquivos
 */
export async function deleteFiles(filePaths: string[]): Promise<void> {
  if (filePaths.length === 0) return;

  try {
    await retryUpload(async () => {
      const { error } = await supabase.storage
        .from('files')
        .remove(filePaths);
      
      if (error) throw error;
    });
  } catch (error) {
    console.error(`Erro ao deletar arquivos:`, error);
  }
}


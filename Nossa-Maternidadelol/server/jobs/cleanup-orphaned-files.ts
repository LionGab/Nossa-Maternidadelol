/**
 * Job periódico para limpar arquivos órfãos do storage
 * Verifica referências no banco e deleta arquivos não referenciados
 */
import { db } from '../storage/drizzle-storage.js';
import { deleteFiles } from '../storage/upload-multipart.js';
import { createClient } from '@supabase/supabase-js';
import * as schema from '../../shared/schema.js';
import { isNotNull } from 'drizzle-orm';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
  {
    // Otimizações para Supabase Pro
    auth: {
      persistSession: false,
    },
  }
);

/**
 * Limpa arquivos órfãos do storage
 * Executa verificação completa e remove arquivos não referenciados
 */
export async function cleanupOrphanedFiles(): Promise<{ deleted: number; errors: number }> {
  let deleted = 0;
  let errors = 0;

  try {
    // 1. Buscar todos os arquivos referenciados no banco
    const [posts, users] = await Promise.all([
      db.select({ imagePath: schema.communityPosts.imagePath })
        .from(schema.communityPosts)
        .where(isNotNull(schema.communityPosts.imagePath)),
      db.select({ avatarPath: schema.users.avatarPath })
        .from(schema.users)
        .where(isNotNull(schema.users.avatarPath)),
    ]);

    const referencedPaths = new Set<string>();
    
    posts.forEach(post => {
      if (post.imagePath) referencedPaths.add(post.imagePath);
    });
    
    users.forEach(user => {
      if (user.avatarPath) referencedPaths.add(user.avatarPath);
    });

    // 2. Listar todos os arquivos no storage
    // Supabase Pro: paginação automática para grandes volumes
    const { data: files, error: listError } = await supabase.storage
      .from('files')
      .list('', {
        limit: 1000, // Supabase Pro permite até 1000 por página
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (listError) {
      console.error('Erro ao listar arquivos:', listError);
      return { deleted: 0, errors: 1 };
    }

    // 3. Identificar arquivos órfãos
    const orphanedFiles = files
      .filter(file => {
        // Verificar se arquivo está referenciado
        const filePath = file.name;
        return !referencedPaths.has(filePath) && 
               !referencedPaths.has(`community-posts/${filePath}`) &&
               !referencedPaths.has(`avatars/${filePath}`);
      })
      .map(file => file.name);

    // 4. Deletar arquivos órfãos
    if (orphanedFiles.length > 0) {
      try {
        await deleteFiles(orphanedFiles);
        deleted = orphanedFiles.length;
        console.log(`✅ Limpeza concluída: ${deleted} arquivos órfãos deletados`);
      } catch (error) {
        console.error('Erro ao deletar arquivos órfãos:', error);
        errors = orphanedFiles.length;
      }
    } else {
      console.log('✅ Nenhum arquivo órfão encontrado');
    }

    return { deleted, errors };
  } catch (error) {
    console.error('Erro na limpeza de arquivos órfãos:', error);
    return { deleted: 0, errors: 1 };
  }
}

/**
 * Executa limpeza periódica (a cada 24 horas)
 */
export function startCleanupJob(): void {
  // Executar imediatamente
  cleanupOrphanedFiles();

  // Executar a cada 24 horas
  if (typeof setInterval !== 'undefined') {
    setInterval(cleanupOrphanedFiles, 24 * 60 * 60 * 1000);
  }
}


/**
 * Rotas da API com todas as melhorias implementadas:
 * - Sanitização de conteúdo
 * - Upload multipart com validação robusta
 * - Transações no banco
 * - Rate limiting
 * - Cleanup de arquivos
 */
import express from 'express';
import rateLimit from 'express-rate-limit';
import { sanitizePostContent, sanitizeCommentContent, sanitizeAiMessage } from './utils/sanitize.js';
import { upload, uploadImage, deleteFile } from './storage/upload-multipart.js';
import { validateBase64Size } from './utils/file-validation.js';
import { createComment, deleteHabit, createReaction, createReport, updateUserStatsAndAchievements, db } from './storage/drizzle-storage.js';
import * as schema from '../shared/schema.js';
import { eq, and, isNotNull } from 'drizzle-orm';
import { generateId } from './utils/id.js';

const router = express.Router();

// Rate limiting para uploads (5 por minuto)
const uploadRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 5,
  message: 'Muitos uploads. Tente novamente em alguns minutos.',
});

// Rate limiting geral para API
const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: 'Muitas requisições. Tente novamente mais tarde.',
});

router.use('/api', apiRateLimit);

/**
 * POST /api/community/posts
 * Cria post na comunidade com sanitização
 */
router.post('/api/community/posts', upload.single('image'), async (req: express.Request & { file?: Express.Multer.File }, res, next) => {
  try {
    const { content, userId } = req.body;

    if (!content || !userId) {
      return res.status(400).json({ error: 'Conteúdo e userId são obrigatórios' });
    }

    // Sanitizar conteúdo
    const sanitizedContent = sanitizePostContent(content);

    let imageUrl = null;
    let imagePath = null;

    // Upload de imagem se fornecido
    if (req.file) {
      try {
        const uploadResult = await uploadImage(req.file, 'community-posts');
        imageUrl = uploadResult.url;
        imagePath = uploadResult.path;
      } catch (uploadError: any) {
        return res.status(400).json({ error: `Erro no upload: ${uploadError.message}` });
      }
    }

    // Criar post em transação
    const [post] = await db.transaction(async (tx) => {
      return await tx
        .insert(schema.communityPosts)
        .values({
          id: generateId(),
          userId,
          content: sanitizedContent,
          imageUrl,
          imagePath,
          createdAt: new Date(),
        })
        .returning();
    });

    res.status(201).json(post);
  } catch (error: any) {
    console.error('Erro ao criar post:', error);
    next(error);
  }
});

/**
 * POST /api/community/posts/:postId/comments
 * Cria comentário com sanitização e transação
 */
router.post('/api/community/posts/:postId/comments', async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { content, userId } = req.body;

    if (!content || !userId) {
      return res.status(400).json({ error: 'Conteúdo e userId são obrigatórios' });
    }

    // Sanitizar conteúdo
    const sanitizedContent = sanitizeCommentContent(content);

    // Criar comentário em transação (incrementa contador automaticamente)
    const comment = await createComment(postId, userId, sanitizedContent);

    res.status(201).json(comment);
  } catch (error: any) {
    console.error('Erro ao criar comentário:', error);
    next(error);
  }
});

/**
 * DELETE /api/community/posts/:postId
 * Deleta post e arquivo associado
 */
router.delete('/api/community/posts/:postId', async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    // Buscar post para pegar imagePath
    const [post] = await db
      .select()
      .from(schema.communityPosts)
      .where(
        and(
          eq(schema.communityPosts.id, postId),
          eq(schema.communityPosts.userId, userId)
        )
      )
      .limit(1);

    if (!post) {
      return res.status(404).json({ error: 'Post não encontrado' });
    }

    // Deletar em transação
    await db.transaction(async (tx) => {
      // Deletar comentários
      await tx
        .delete(schema.comments)
        .where(eq(schema.comments.postId, postId));

      // Deletar reações
      await tx
        .delete(schema.reactions)
        .where(eq(schema.reactions.postId, postId));

      // Deletar post
      await tx
        .delete(schema.communityPosts)
        .where(eq(schema.communityPosts.id, postId));
    });

    // Deletar arquivo do storage (não bloqueia se falhar)
    if (post.imagePath) {
      await deleteFile(post.imagePath);
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao deletar post:', error);
    next(error);
  }
});

/**
 * POST /api/community/posts/:postId/reactions
 * Cria reação em transação
 */
router.post('/api/community/posts/:postId/reactions', async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { userId, type } = req.body;

    if (!userId || !type) {
      return res.status(400).json({ error: 'userId e type são obrigatórios' });
    }

    await createReaction(postId, userId, type);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao criar reação:', error);
    next(error);
  }
});

/**
 * POST /api/community/posts/:postId/reports
 * Cria report em transação (com auto-hide)
 */
router.post('/api/community/posts/:postId/reports', async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { userId, reason } = req.body;

    if (!userId || !reason) {
      return res.status(400).json({ error: 'userId e reason são obrigatórios' });
    }

    await createReport(postId, userId, reason);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao criar report:', error);
    next(error);
  }
});

/**
 * DELETE /api/habits/:habitId
 * Deleta hábito e completions em transação
 */
router.delete('/api/habits/:habitId', async (req, res, next) => {
  try {
    const { habitId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId é obrigatório' });
    }

    await deleteHabit(habitId, userId);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao deletar hábito:', error);
    next(error);
  }
});

/**
 * POST /api/ai/messages
 * Cria mensagem de IA com sanitização
 */
router.post('/api/ai/messages', async (req, res, next) => {
  try {
    const { sessionId, content, role } = req.body;

    if (!sessionId || !content || !role) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    // Sanitizar conteúdo (mais restritivo para IA)
    const sanitizedContent = sanitizeAiMessage(content);

    const [message] = await db
      .insert(schema.aiMessages)
      .values({
        id: generateId(),
        sessionId,
        content: sanitizedContent,
        role,
        createdAt: new Date(),
      })
      .returning();

    res.status(201).json(message);
  } catch (error: any) {
    console.error('Erro ao criar mensagem de IA:', error);
    next(error);
  }
});

/**
 * POST /api/users/:userId/stats
 * Atualiza stats e achievements em transação
 */
router.post('/api/users/:userId/stats', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { stats, achievementId } = req.body;

    await updateUserStatsAndAchievements(userId, stats, achievementId);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao atualizar stats:', error);
    next(error);
  }
});

/**
 * POST /api/upload/avatar (compatibilidade com base64 - DEPRECATED)
 * Mantido para compatibilidade, mas valida tamanho ANTES de decodificar
 */
router.post('/api/upload/avatar', uploadRateLimit, async (req, res, next) => {
  try {
    const { imageBase64, userId } = req.body;

    if (!imageBase64 || !userId) {
      return res.status(400).json({ error: 'imageBase64 e userId são obrigatórios' });
    }

    // VALIDAR TAMANHO ANTES DE DECODIFICAR
    if (!validateBase64Size(imageBase64, 5 * 1024 * 1024)) {
      return res.status(400).json({ error: 'Arquivo muito grande (máx 5MB)' });
    }

    // Decodificar base64
    const buffer = Buffer.from(imageBase64, 'base64');

    // Criar file object fake para usar uploadImage
    const fakeFile: Express.Multer.File = {
      fieldname: 'avatar',
      originalname: 'avatar.jpg',
      encoding: 'base64',
      mimetype: 'image/jpeg',
      size: buffer.length,
      buffer,
      destination: '',
      filename: '',
      path: '',
    };

    const result = await uploadImage(fakeFile, 'avatars');

    // Deletar avatar antigo se existir
    const user = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);

    if (user[0]?.avatarPath) {
      await deleteFile(user[0].avatarPath);
    }

    // Atualizar usuário
    await db
      .update(schema.users)
      .set({ 
        avatarUrl: result.url,
        avatarPath: result.path,
      })
      .where(eq(schema.users.id, userId));

    res.json({ url: result.url });
  } catch (error: any) {
    console.error('Erro ao fazer upload de avatar:', error);
    next(error);
  }
});

export default router;


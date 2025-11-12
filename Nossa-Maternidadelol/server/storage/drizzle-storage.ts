/**
 * Operações de banco de dados com transações para garantir consistência
 * Todas as operações críticas usam transações
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../../shared/schema.js';
import { eq, and, sql } from 'drizzle-orm';
import { generateId } from '../utils/id.js';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
export const db = drizzle(client, { schema });

/**
 * Cria comentário e incrementa contador em transação
 */
export async function createComment(
  postId: string,
  userId: string,
  content: string
) {
  return db.transaction(async (tx) => {
    // 1. Criar comentário
    const [comment] = await tx
      .insert(schema.comments)
      .values({
        id: generateId(),
        postId,
        userId,
        content,
        createdAt: new Date(),
      })
      .returning();

    // 2. Incrementar contador (atômico)
    await tx
      .update(schema.communityPosts)
      .set({ 
        commentCount: sql`${schema.communityPosts.commentCount} + 1` 
      })
      .where(eq(schema.communityPosts.id, postId));

    return comment;
  });
}

/**
 * Deleta hábito e suas completions em transação
 */
export async function deleteHabit(habitId: string, userId: string) {
  return db.transaction(async (tx) => {
    // 1. Deletar completions primeiro (foreign key)
    await tx
      .delete(schema.habitCompletions)
      .where(eq(schema.habitCompletions.habitId, habitId));

    // 2. Deletar hábito
    await tx
      .delete(schema.habits)
      .where(
        and(
          eq(schema.habits.id, habitId),
          eq(schema.habits.userId, userId)
        )
      );
  });
}

/**
 * Cria reação e incrementa contador em transação
 */
export async function createReaction(
  postId: string,
  userId: string,
  type: 'like' | 'love' | 'support'
) {
  return db.transaction(async (tx) => {
    // Verificar se já existe
    const existing = await tx
      .select()
      .from(schema.reactions)
      .where(
        and(
          eq(schema.reactions.postId, postId),
          eq(schema.reactions.userId, userId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Atualizar reação existente
      await tx
        .update(schema.reactions)
        .set({ type })
        .where(eq(schema.reactions.id, existing[0].id));
    } else {
      // Criar nova reação
      await tx.insert(schema.reactions).values({
        id: generateId(),
        postId,
        userId,
        type,
        createdAt: new Date(),
      });

      // Incrementar contador
      await tx
        .update(schema.communityPosts)
        .set({ 
          reactionCount: sql`${schema.communityPosts.reactionCount} + 1` 
        })
        .where(eq(schema.communityPosts.id, postId));
    }
  });
}

/**
 * Cria report e incrementa contador + auto-hide em transação
 */
export async function createReport(
  postId: string,
  userId: string,
  reason: string
) {
  return db.transaction(async (tx) => {
    // 1. Criar report
    await tx.insert(schema.reports).values({
      id: generateId(),
      postId,
      userId,
      reason,
      createdAt: new Date(),
    });

    // 2. Incrementar contador
    await tx
      .update(schema.communityPosts)
      .set({ 
        reportCount: sql`${schema.communityPosts.reportCount} + 1` 
      })
      .where(eq(schema.communityPosts.id, postId));

    // 3. Auto-hide se reportCount >= 5
    const post = await tx
      .select()
      .from(schema.communityPosts)
      .where(eq(schema.communityPosts.id, postId))
      .limit(1);

    if (post[0] && post[0].reportCount !== null && post[0].reportCount >= 4) { // 4 porque já incrementou acima
      await tx
        .update(schema.communityPosts)
        .set({ isHidden: true })
        .where(eq(schema.communityPosts.id, postId));
    }
  });
}

/**
 * Atualiza stats e desbloqueia achievement em transação
 */
export async function updateUserStatsAndAchievements(
  userId: string,
  statsUpdate: {
    totalPosts?: number;
    totalComments?: number;
    totalReactions?: number;
    streakDays?: number;
  },
  achievementId?: string
) {
  return db.transaction(async (tx) => {
    // 1. Atualizar ou criar stats
    const existing = await tx
      .select()
      .from(schema.userStats)
      .where(eq(schema.userStats.userId, userId))
      .limit(1);

    if (existing.length > 0) {
      await tx
        .update(schema.userStats)
        .set(statsUpdate)
        .where(eq(schema.userStats.userId, userId));
    } else {
      await tx.insert(schema.userStats).values({
        id: generateId(),
        userId,
        ...statsUpdate,
      });
    }

    // 2. Desbloquear achievement se fornecido
    if (achievementId) {
      // Verificar se já existe antes de inserir
      const existing = await tx
        .select()
        .from(schema.userAchievements)
        .where(
          and(
            eq(schema.userAchievements.userId, userId),
            eq(schema.userAchievements.achievementId, achievementId)
          )
        )
        .limit(1);

      if (existing.length === 0) {
        await tx.insert(schema.userAchievements).values({
          id: generateId(),
          userId,
          achievementId,
          unlockedAt: new Date(),
        });
      }
    }
  });
}


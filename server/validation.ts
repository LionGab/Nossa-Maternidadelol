import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import { fromZodError } from "zod-validation-error";

/**
 * Validation schemas for API inputs
 */

// NathIA Chat
export const nathiaChatSchema = z.object({
  sessionId: z.string().uuid("ID de sessão inválido"),
  message: z
    .string()
    .min(1, "Mensagem não pode estar vazia")
    .max(2000, "Mensagem muito longa (máximo 2000 caracteres)")
    .trim(),
});

// MãeValente Search
export const maeValenteSearchSchema = z.object({
  question: z
    .string()
    .min(3, "Pergunta muito curta (mínimo 3 caracteres)")
    .max(500, "Pergunta muito longa (máximo 500 caracteres)")
    .trim(),
});

// Save Q&A
export const saveQaSchema = z.object({
  question: z.string().min(1, "Pergunta não pode estar vazia").max(500),
  answer: z.string().min(1, "Resposta não pode estar vazia"),
  sources: z.array(
    z.object({
      title: z.string(),
      url: z.string().url("URL inválida"),
    })
  ),
});

// Create Habit
export const createHabitSchema = z.object({
  title: z
    .string()
    .min(1, "Título não pode estar vazio")
    .max(50, "Título muito longo (máximo 50 caracteres)")
    .trim(),
  emoji: z.string().emoji("Emoji inválido").or(z.string().max(2)),
  color: z.string().regex(/^from-\w+-\d+\s+to-\w+-\d+$/, "Formato de cor inválido"),
});

// Create Community Post
// Note: authorName and avatarUrl are populated from authenticated user profile
export const createCommunityPostSchema = z.object({
  type: z.enum(["desabafo", "vitoria", "apoio", "reflexao"], {
    errorMap: () => ({ message: "Tipo de post inválido" }),
  }),
  content: z
    .string()
    .min(10, "Conteúdo muito curto (mínimo 10 caracteres)")
    .max(1000, "Conteúdo muito longo (máximo 1000 caracteres)")
    .trim(),
  tag: z.string().max(30, "Tag muito longa (máximo 30 caracteres)").optional(),
});

// Create Comment
// Note: authorName and avatarUrl are populated from authenticated user profile
export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Comentário não pode estar vazio")
    .max(150, "Comentário muito longo (máximo 150 caracteres)")
    .trim(),
});

// Create Reaction
export const createReactionSchema = z.object({
  type: z.enum(["heart", "hands", "sparkles"], {
    errorMap: () => ({ message: "Tipo de reação inválido" }),
  }),
});

// Create Report
export const createReportSchema = z.object({
  reason: z.string().max(200, "Motivo muito longo (máximo 200 caracteres)").optional(),
});

// Create Favorite
export const createFavoriteSchema = z.object({
  postId: z.string().uuid("ID de post inválido"),
});

// UUID param validation
export const uuidParamSchema = z.object({
  id: z.string().uuid("ID inválido"),
});

export const postIdParamSchema = z.object({
  postId: z.string().uuid("ID de post inválido"),
});

export const habitIdParamSchema = z.object({
  habitId: z.string().uuid("ID de hábito inválido"),
});

export const sessionIdParamSchema = z.object({
  sessionId: z.string().uuid("ID de sessão inválido"),
});

/**
 * Middleware factory for request body validation
 */
export function validateBody<T extends z.ZodTypeAny>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({
          error: "Dados inválidos",
          details: validationError.message,
        });
      }
      next(error);
    }
  };
}

/**
 * Middleware factory for query params validation
 */
export function validateQuery<T extends z.ZodTypeAny>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.query);
      req.query = validated as any;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({
          error: "Parâmetros inválidos",
          details: validationError.message,
        });
      }
      next(error);
    }
  };
}

/**
 * Middleware factory for URL params validation
 */
export function validateParams<T extends z.ZodTypeAny>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.params);
      req.params = validated as any;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({
          error: "Parâmetros de URL inválidos",
          details: validationError.message,
        });
      }
      next(error);
    }
  };
}

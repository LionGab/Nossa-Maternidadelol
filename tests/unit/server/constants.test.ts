import { describe, it, expect } from "vitest";
import {
  GAMIFICATION,
  ACHIEVEMENTS,
  COMMUNITY,
  AI,
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from "../../../server/constants";

describe("Constants", () => {
  describe("GAMIFICATION", () => {
    it("deve ter XP_PER_COMPLETION definido", () => {
      expect(GAMIFICATION.XP_PER_COMPLETION).toBe(10);
    });

    it("deve ter XP_PER_LEVEL definido", () => {
      expect(GAMIFICATION.XP_PER_LEVEL).toBe(100);
    });

    it("deve ter MAX_HABITS definido", () => {
      expect(GAMIFICATION.MAX_HABITS).toBeGreaterThan(0);
    });

    it("deve ter MAX_STREAK_DAYS definido como 365", () => {
      expect(GAMIFICATION.MAX_STREAK_DAYS).toBe(365);
    });
  });

  describe("ACHIEVEMENTS", () => {
    it("deve ter todas as chaves de achievement definidas", () => {
      expect(ACHIEVEMENTS.STREAK_3).toBe("streak_3");
      expect(ACHIEVEMENTS.STREAK_7).toBe("streak_7");
      expect(ACHIEVEMENTS.STREAK_30).toBe("streak_30");
      expect(ACHIEVEMENTS.COMPLETIONS_10).toBe("completions_10");
      expect(ACHIEVEMENTS.LEVEL_5).toBe("level_5");
    });

    it("deve ter thresholds correspondentes", () => {
      expect(ACHIEVEMENTS.THRESHOLDS.STREAK_3).toBe(3);
      expect(ACHIEVEMENTS.THRESHOLDS.STREAK_7).toBe(7);
      expect(ACHIEVEMENTS.THRESHOLDS.STREAK_30).toBe(30);
      expect(ACHIEVEMENTS.THRESHOLDS.COMPLETIONS_10).toBe(10);
    });

    it("thresholds devem ser crescentes", () => {
      expect(ACHIEVEMENTS.THRESHOLDS.STREAK_3).toBeLessThan(
        ACHIEVEMENTS.THRESHOLDS.STREAK_7
      );
      expect(ACHIEVEMENTS.THRESHOLDS.STREAK_7).toBeLessThan(
        ACHIEVEMENTS.THRESHOLDS.STREAK_30
      );
    });
  });

  describe("COMMUNITY", () => {
    it("deve ter limites de comunidade definidos", () => {
      expect(COMMUNITY.MAX_COMMENTS_PER_POST).toBeGreaterThan(0);
      expect(COMMUNITY.MAX_COMMENT_LENGTH).toBeGreaterThan(0);
      expect(COMMUNITY.MAX_REPORTS_BEFORE_HIDE).toBeGreaterThan(0);
    });
  });

  describe("AI", () => {
    it("deve ter configurações de AI definidas", () => {
      expect(AI.RECENT_MESSAGES_COUNT).toBeGreaterThan(0);
      expect(AI.RECENT_ACHIEVEMENTS_COUNT).toBeGreaterThan(0);
      expect(AI.PERPLEXITY_MAX_SOURCES).toBeGreaterThan(0);
    });
  });

  describe("HTTP_STATUS", () => {
    it("deve ter códigos HTTP 2xx definidos", () => {
      expect(HTTP_STATUS.OK).toBe(200);
      expect(HTTP_STATUS.CREATED).toBe(201);
      expect(HTTP_STATUS.NO_CONTENT).toBe(204);
    });

    it("deve ter códigos HTTP 4xx definidos", () => {
      expect(HTTP_STATUS.BAD_REQUEST).toBe(400);
      expect(HTTP_STATUS.UNAUTHORIZED).toBe(401);
      expect(HTTP_STATUS.FORBIDDEN).toBe(403);
      expect(HTTP_STATUS.NOT_FOUND).toBe(404);
      expect(HTTP_STATUS.CONFLICT).toBe(409);
      expect(HTTP_STATUS.TOO_MANY_REQUESTS).toBe(429);
    });

    it("deve ter códigos HTTP 5xx definidos", () => {
      expect(HTTP_STATUS.INTERNAL_SERVER_ERROR).toBe(500);
    });
  });

  describe("ERROR_MESSAGES", () => {
    it("deve ter mensagens de erro de autenticação", () => {
      expect(ERROR_MESSAGES.INVALID_CREDENTIALS).toContain("incorretos");
      expect(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS).toContain("cadastrado");
      expect(ERROR_MESSAGES.UNAUTHORIZED).toContain("logado");
    });

    it("deve ter mensagens de rate limiting", () => {
      expect(ERROR_MESSAGES.TOO_MANY_REQUESTS_AI).toContain("Aguarde");
      expect(ERROR_MESSAGES.TOO_MANY_REQUESTS_AUTH).toContain("15 minutos");
    });

    it("deve ter mensagens de validação", () => {
      expect(ERROR_MESSAGES.INVALID_INPUT).toContain("inválidos");
      expect(ERROR_MESSAGES.PASSWORD_TOO_SHORT).toContain("8 caracteres");
    });

    it("deve ter mensagens de recursos não encontrados", () => {
      expect(ERROR_MESSAGES.NOT_FOUND).toContain("não encontrado");
      expect(ERROR_MESSAGES.HABIT_NOT_FOUND).toContain("Hábito");
      expect(ERROR_MESSAGES.POST_NOT_FOUND).toContain("Post");
    });

    it("deve ter mensagens de erro genéricas", () => {
      expect(ERROR_MESSAGES.INTERNAL_ERROR).toContain("interno");
      expect(ERROR_MESSAGES.DATABASE_ERROR).toContain("banco de dados");
    });
  });

  describe("SUCCESS_MESSAGES", () => {
    it("deve ter mensagens de sucesso de autenticação", () => {
      expect(SUCCESS_MESSAGES.LOGIN_SUCCESS).toContain("sucesso");
      expect(SUCCESS_MESSAGES.REGISTER_SUCCESS).toContain("criada");
    });

    it("deve ter mensagens de sucesso de hábitos", () => {
      expect(SUCCESS_MESSAGES.HABIT_CREATED).toContain("criado");
      expect(SUCCESS_MESSAGES.HABIT_COMPLETED).toContain("concluído");
    });

    it("deve ter mensagens de sucesso de comunidade", () => {
      expect(SUCCESS_MESSAGES.POST_CREATED).toContain("publicado");
      expect(SUCCESS_MESSAGES.COMMENT_CREATED).toContain("adicionado");
      expect(SUCCESS_MESSAGES.REPORT_SUBMITTED).toContain("Denúncia");
    });

    it("deve ter mensagens de sucesso de favoritos", () => {
      expect(SUCCESS_MESSAGES.FAVORITE_ADDED).toContain("favoritos");
      expect(SUCCESS_MESSAGES.FAVORITE_REMOVED).toContain("Removido");
    });
  });
});

import { describe, it, expect } from "vitest";
import {
  nathiaChatSchema,
  maeValenteSearchSchema,
  saveQaSchema,
  createHabitSchema,
  createCommunityPostSchema,
  createCommentSchema,
  createReactionSchema,
  createReportSchema,
  createFavoriteSchema,
  postIdParamSchema,
  habitIdParamSchema,
} from "../../../server/validation";

describe("Validation Schemas", () => {
  describe("nathiaChatSchema", () => {
    it("deve validar input válido", () => {
      const valid = {
        sessionId: "123e4567-e89b-12d3-a456-426614174000",
        message: "Olá, como você está?",
      };
      expect(() => nathiaChatSchema.parse(valid)).not.toThrow();
    });

    it("deve rejeitar sessionId inválido", () => {
      const invalid = {
        sessionId: "not-a-uuid",
        message: "Teste",
      };
      expect(() => nathiaChatSchema.parse(invalid)).toThrow();
    });

    it("deve rejeitar mensagem vazia", () => {
      const invalid = {
        sessionId: "123e4567-e89b-12d3-a456-426614174000",
        message: "",
      };
      expect(() => nathiaChatSchema.parse(invalid)).toThrow("Mensagem não pode estar vazia");
    });

    it("deve rejeitar mensagem muito longa", () => {
      const invalid = {
        sessionId: "123e4567-e89b-12d3-a456-426614174000",
        message: "a".repeat(2001),
      };
      expect(() => nathiaChatSchema.parse(invalid)).toThrow("Mensagem muito longa");
    });

    it("deve trimar espaços em branco", () => {
      const input = {
        sessionId: "123e4567-e89b-12d3-a456-426614174000",
        message: "  teste  ",
      };
      const result = nathiaChatSchema.parse(input);
      expect(result.message).toBe("teste");
    });
  });

  describe("maeValenteSearchSchema", () => {
    it("deve validar pergunta válida", () => {
      const valid = { question: "O que é depressão pós-parto?" };
      expect(() => maeValenteSearchSchema.parse(valid)).not.toThrow();
    });

    it("deve rejeitar pergunta muito curta", () => {
      const invalid = { question: "ab" };
      expect(() => maeValenteSearchSchema.parse(invalid)).toThrow("Pergunta muito curta");
    });

    it("deve rejeitar pergunta muito longa", () => {
      const invalid = { question: "a".repeat(501) };
      expect(() => maeValenteSearchSchema.parse(invalid)).toThrow("Pergunta muito longa");
    });
  });

  describe("saveQaSchema", () => {
    it("deve validar Q&A válido", () => {
      const valid = {
        question: "Teste?",
        answer: "Resposta",
        sources: [{ title: "Fonte", url: "https://example.com" }],
      };
      expect(() => saveQaSchema.parse(valid)).not.toThrow();
    });

    it("deve rejeitar URL inválida", () => {
      const invalid = {
        question: "Teste?",
        answer: "Resposta",
        sources: [{ title: "Fonte", url: "not-a-url" }],
      };
      expect(() => saveQaSchema.parse(invalid)).toThrow("URL inválida");
    });
  });

  describe("createHabitSchema", () => {
    it("deve validar hábito válido", () => {
      const valid = {
        title: "Beber água",
        emoji: "💧",
        color: "from-blue-500 to-cyan-500",
      };
      expect(() => createHabitSchema.parse(valid)).not.toThrow();
    });

    it("deve rejeitar título vazio", () => {
      const invalid = {
        title: "",
        emoji: "💧",
        color: "from-blue-500 to-cyan-500",
      };
      expect(() => createHabitSchema.parse(invalid)).toThrow("Título não pode estar vazio");
    });

    it("deve rejeitar título muito longo", () => {
      const invalid = {
        title: "a".repeat(51),
        emoji: "💧",
        color: "from-blue-500 to-cyan-500",
      };
      expect(() => createHabitSchema.parse(invalid)).toThrow("Título muito longo");
    });

    it("deve rejeitar formato de cor inválido", () => {
      const invalid = {
        title: "Teste",
        emoji: "💧",
        color: "invalid-color",
      };
      expect(() => createHabitSchema.parse(invalid)).toThrow("Formato de cor inválido");
    });
  });

  describe("createCommunityPostSchema", () => {
    it("deve validar post válido", () => {
      const valid = {
        type: "desabafo",
        content: "Este é um conteúdo válido com mais de 10 caracteres",
      };
      expect(() => createCommunityPostSchema.parse(valid)).not.toThrow();
    });

    it("deve rejeitar tipo inválido", () => {
      const invalid = {
        type: "invalido",
        content: "Conteúdo válido",
      };
      expect(() => createCommunityPostSchema.parse(invalid)).toThrow("Tipo de post inválido");
    });

    it("deve rejeitar conteúdo muito curto", () => {
      const invalid = {
        type: "desabafo",
        content: "curto",
      };
      expect(() => createCommunityPostSchema.parse(invalid)).toThrow("Conteúdo muito curto");
    });
  });

  describe("createCommentSchema", () => {
    it("deve validar comentário válido", () => {
      const valid = { content: "Comentário válido" };
      expect(() => createCommentSchema.parse(valid)).not.toThrow();
    });

    it("deve rejeitar comentário vazio", () => {
      const invalid = { content: "" };
      expect(() => createCommentSchema.parse(invalid)).toThrow("Comentário não pode estar vazio");
    });

    it("deve rejeitar comentário muito longo", () => {
      const invalid = { content: "a".repeat(151) };
      expect(() => createCommentSchema.parse(invalid)).toThrow("Comentário muito longo");
    });
  });

  describe("createReactionSchema", () => {
    it("deve validar reação válida", () => {
      const valid = { type: "heart" };
      expect(() => createReactionSchema.parse(valid)).not.toThrow();
    });

    it("deve rejeitar tipo inválido", () => {
      const invalid = { type: "invalid" };
      expect(() => createReactionSchema.parse(invalid)).toThrow("Tipo de reação inválido");
    });
  });

  describe("createReportSchema", () => {
    it("deve validar report sem reason", () => {
      const valid = {};
      expect(() => createReportSchema.parse(valid)).not.toThrow();
    });

    it("deve validar report com reason", () => {
      const valid = { reason: "Conteúdo inadequado" };
      expect(() => createReportSchema.parse(valid)).not.toThrow();
    });

    it("deve rejeitar reason muito longo", () => {
      const invalid = { reason: "a".repeat(201) };
      expect(() => createReportSchema.parse(invalid)).toThrow("Motivo muito longo");
    });
  });

  describe("createFavoriteSchema", () => {
    it("deve validar favorite válido", () => {
      const valid = { postId: "123e4567-e89b-12d3-a456-426614174000" };
      expect(() => createFavoriteSchema.parse(valid)).not.toThrow();
    });

    it("deve rejeitar postId inválido", () => {
      const invalid = { postId: "not-a-uuid" };
      expect(() => createFavoriteSchema.parse(invalid)).toThrow("ID de post inválido");
    });
  });

  describe("Param Schemas", () => {
    it("deve validar postIdParamSchema", () => {
      const valid = { postId: "123e4567-e89b-12d3-a456-426614174000" };
      expect(() => postIdParamSchema.parse(valid)).not.toThrow();
    });

    it("deve validar habitIdParamSchema", () => {
      const valid = { habitId: "123e4567-e89b-12d3-a456-426614174000" };
      expect(() => habitIdParamSchema.parse(valid)).not.toThrow();
    });
  });
});


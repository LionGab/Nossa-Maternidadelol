import { describe, it, expect } from "vitest";
import {
  nathiaChatSchema,
  maeValenteSearchSchema,
  createHabitSchema,
  createCommunityPostSchema,
  createCommentSchema,
} from "../../../server/validation";

describe("Validation Schemas", () => {
  describe("nathiaChatSchema", () => {
    it("deve validar mensagem válida", () => {
      const result = nathiaChatSchema.safeParse({
        sessionId: "123e4567-e89b-12d3-a456-426614174000",
        message: "Olá, como posso lidar com ansiedade?",
      });
      expect(result.success).toBe(true);
    });

    it("deve rejeitar mensagem vazia", () => {
      const result = nathiaChatSchema.safeParse({
        sessionId: "123e4567-e89b-12d3-a456-426614174000",
        message: "",
      });
      expect(result.success).toBe(false);
    });

    it("deve rejeitar UUID inválido", () => {
      const result = nathiaChatSchema.safeParse({
        sessionId: "invalid-uuid",
        message: "Teste",
      });
      expect(result.success).toBe(false);
    });

    it("deve rejeitar mensagem muito longa", () => {
      const result = nathiaChatSchema.safeParse({
        sessionId: "123e4567-e89b-12d3-a456-426614174000",
        message: "a".repeat(2001),
      });
      expect(result.success).toBe(false);
    });
  });

  describe("maeValenteSearchSchema", () => {
    it("deve validar pergunta válida", () => {
      const result = maeValenteSearchSchema.safeParse({
        question: "O que é depressão pós-parto?",
      });
      expect(result.success).toBe(true);
    });

    it("deve rejeitar pergunta muito curta", () => {
      const result = maeValenteSearchSchema.safeParse({
        question: "ab",
      });
      expect(result.success).toBe(false);
    });

    it("deve rejeitar pergunta muito longa", () => {
      const result = maeValenteSearchSchema.safeParse({
        question: "a".repeat(501),
      });
      expect(result.success).toBe(false);
    });
  });

  describe("createHabitSchema", () => {
    it("deve validar hábito válido", () => {
      const result = createHabitSchema.safeParse({
        title: "Meditar 10 min",
        emoji: "🧘‍♀️",
        color: "from-purple-400 to-pink-400",
      });
      expect(result.success).toBe(true);
    });

    it("deve rejeitar título muito longo", () => {
      const result = createHabitSchema.safeParse({
        title: "a".repeat(51),
        emoji: "🧘‍♀️",
        color: "from-purple-400 to-pink-400",
      });
      expect(result.success).toBe(false);
    });

    it("deve rejeitar título vazio", () => {
      const result = createHabitSchema.safeParse({
        title: "",
        emoji: "🧘‍♀️",
        color: "from-purple-400 to-pink-400",
      });
      expect(result.success).toBe(false);
    });

    it("deve rejeitar emoji vazio", () => {
      const result = createHabitSchema.safeParse({
        title: "Meditar",
        emoji: "",
        color: "from-purple-400 to-pink-400",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("createCommunityPostSchema", () => {
    it("deve validar post válido", () => {
      const result = createCommunityPostSchema.safeParse({
        type: "desabafo",
        content: "Hoje foi um dia difícil, preciso desabafar...",
        tag: "ansiedade",
      });
      expect(result.success).toBe(true);
    });

    it("deve validar post sem tag", () => {
      const result = createCommunityPostSchema.safeParse({
        type: "vitoria",
        content: "Consegui superar minha ansiedade hoje!",
      });
      expect(result.success).toBe(true);
    });

    it("deve rejeitar conteúdo muito curto", () => {
      const result = createCommunityPostSchema.safeParse({
        type: "desabafo",
        content: "abc",
      });
      expect(result.success).toBe(false);
    });

    it("deve rejeitar conteúdo muito longo", () => {
      const result = createCommunityPostSchema.safeParse({
        type: "desabafo",
        content: "a".repeat(1001),
      });
      expect(result.success).toBe(false);
    });

    it("deve rejeitar tipo inválido", () => {
      const result = createCommunityPostSchema.safeParse({
        type: "tipo_invalido",
        content: "Conteúdo válido",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("createCommentSchema", () => {
    it("deve validar comentário válido", () => {
      const result = createCommentSchema.safeParse({
        content: "Também passei por isso, você não está sozinha!",
      });
      expect(result.success).toBe(true);
    });

    it("deve rejeitar comentário vazio", () => {
      const result = createCommentSchema.safeParse({
        content: "",
      });
      expect(result.success).toBe(false);
    });

    it("deve rejeitar comentário muito longo", () => {
      const result = createCommentSchema.safeParse({
        content: "a".repeat(151),
      });
      expect(result.success).toBe(false);
    });
  });
});

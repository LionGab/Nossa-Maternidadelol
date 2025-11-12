import { describe, it, expect } from "vitest";
import {
  paginationSchema,
  paginateArray,
  calculatePagination,
  createPaginatedResponse,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
} from "../../../server/pagination";

describe("Pagination Utilities", () => {
  describe("paginationSchema", () => {
    it("deve usar valores padrão quando não especificado", () => {
      const result = paginationSchema.parse({});
      expect(result.page).toBe(DEFAULT_PAGE);
      expect(result.limit).toBe(DEFAULT_LIMIT);
    });

    it("deve validar page e limit válidos", () => {
      const result = paginationSchema.parse({ page: "2", limit: "50" });
      expect(result.page).toBe(2);
      expect(result.limit).toBe(50);
    });

    it("deve rejeitar page < 1", () => {
      expect(() => paginationSchema.parse({ page: "0" })).toThrow("Page must be >= 1");
    });

    it("deve rejeitar limit > MAX_LIMIT", () => {
      expect(() => paginationSchema.parse({ limit: "101" })).toThrow(
        `Limit must be between 1 and ${MAX_LIMIT}`
      );
    });

    it("deve rejeitar limit < 1", () => {
      expect(() => paginationSchema.parse({ limit: "0" })).toThrow(
        `Limit must be between 1 and ${MAX_LIMIT}`
      );
    });
  });

  describe("calculatePagination", () => {
    it("deve calcular metadata corretamente", () => {
      const meta = calculatePagination(2, 20, 50);
      expect(meta.page).toBe(2);
      expect(meta.limit).toBe(20);
      expect(meta.total).toBe(50);
      expect(meta.totalPages).toBe(3);
      expect(meta.hasNext).toBe(true);
      expect(meta.hasPrev).toBe(true);
    });

    it("deve indicar primeira página", () => {
      const meta = calculatePagination(1, 20, 50);
      expect(meta.hasPrev).toBe(false);
      expect(meta.hasNext).toBe(true);
    });

    it("deve indicar última página", () => {
      const meta = calculatePagination(3, 20, 50);
      expect(meta.hasNext).toBe(false);
      expect(meta.hasPrev).toBe(true);
    });

    it("deve calcular totalPages corretamente com divisão não exata", () => {
      const meta = calculatePagination(1, 20, 51);
      expect(meta.totalPages).toBe(3); // Math.ceil(51/20) = 3
    });
  });

  describe("paginateArray", () => {
    const testData = Array.from({ length: 100 }, (_, i) => ({ id: i + 1, name: `Item ${i + 1}` }));

    it("deve paginar array corretamente", () => {
      const result = paginateArray(testData, 1, 20);
      expect(result.data.length).toBe(20);
      expect(result.data[0].id).toBe(1);
      expect(result.data[19].id).toBe(20);
      expect(result.meta.total).toBe(100);
      expect(result.meta.totalPages).toBe(5);
    });

    it("deve retornar página 2 corretamente", () => {
      const result = paginateArray(testData, 2, 20);
      expect(result.data.length).toBe(20);
      expect(result.data[0].id).toBe(21);
      expect(result.data[19].id).toBe(40);
      expect(result.meta.page).toBe(2);
    });

    it("deve retornar última página parcial", () => {
      const result = paginateArray(testData, 5, 20);
      expect(result.data.length).toBe(20);
      expect(result.meta.hasNext).toBe(false);
    });

    it("deve retornar array vazio se página não existe", () => {
      const result = paginateArray(testData, 10, 20);
      expect(result.data.length).toBe(0);
      expect(result.meta.hasNext).toBe(false);
    });
  });

  describe("createPaginatedResponse", () => {
    it("deve criar resposta paginada corretamente", () => {
      const data = [{ id: 1 }, { id: 2 }];
      const result = createPaginatedResponse(data, 1, 20, 50);
      expect(result.data).toEqual(data);
      expect(result.meta.total).toBe(50);
      expect(result.meta.totalPages).toBe(3);
    });
  });
});


import { z } from "zod";

/**
 * Pagination utilities for API endpoints
 */

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

/**
 * Query parameter schema for pagination
 */
export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : DEFAULT_PAGE))
    .refine((val) => val >= 1, { message: "Page must be >= 1" }),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : DEFAULT_LIMIT))
    .refine((val) => val >= 1 && val <= MAX_LIMIT, {
      message: `Limit must be between 1 and ${MAX_LIMIT}`,
    }),
});

export type PaginationParams = z.infer<typeof paginationSchema>;

/**
 * Pagination metadata for response
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Calculate pagination metadata
 */
export function calculatePagination(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * Paginate an array in memory
 * Use for small datasets or when DB pagination is not available
 */
export function paginateArray<T>(
  data: T[],
  page: number,
  limit: number
): PaginatedResponse<T> {
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedData = data.slice(start, end);

  return {
    data: paginatedData,
    meta: calculatePagination(page, limit, data.length),
  };
}

/**
 * Create paginated response from database results
 */
export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): PaginatedResponse<T> {
  return {
    data,
    meta: calculatePagination(page, limit, total),
  };
}

/**
 * Storage module - exports interface and factory function
 * Use DrizzleStorage with Supabase PostgreSQL in production or when DATABASE_URL is set
 * Use MemStorage in development when DATABASE_URL is not configured
 */

export type { IStorage } from "./types";
export { MemStorage } from "./mem-storage";
export { DrizzleStorage } from "./drizzle-storage";

import { MemStorage } from "./mem-storage";
import { DrizzleStorage } from "./drizzle-storage";

// Use DrizzleStorage with Supabase PostgreSQL in production or when DATABASE_URL is set
// Use MemStorage in development when DATABASE_URL is not configured
export const storage = process.env.DATABASE_URL
  ? new DrizzleStorage()
  : process.env.NODE_ENV === "production"
    ? (() => {
      throw new Error("DATABASE_URL é obrigatória em produção");
    })()
    : new MemStorage();


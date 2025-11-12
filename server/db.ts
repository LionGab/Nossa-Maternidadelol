import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "@shared/schema";

// DATABASE_URL is required in production
// In development, MemStorage is used when DATABASE_URL is not configured
const isProduction = process.env.NODE_ENV === "production";

let dbInstance: NeonHttpDatabase<typeof schema> | null = null;

function createDb(): NeonHttpDatabase<typeof schema> {
  if (!process.env.DATABASE_URL) {
    if (isProduction) {
      throw new Error(
        "DATABASE_URL não configurada. Configure a variável de ambiente no arquivo .env"
      );
    }
    // In development, throw error if db is actually used without DATABASE_URL
    // This should never happen because storage.ts uses MemStorage when DATABASE_URL is not set
    throw new Error(
      "DATABASE_URL não configurada. Em desenvolvimento, use MemStorage ao invés de DrizzleStorage."
    );
  }

  if (!dbInstance) {
    // Create Neon HTTP client
    const sql = neon(process.env.DATABASE_URL);
    // Create Drizzle instance with schema
    dbInstance = drizzle(sql, { schema });
  }

  return dbInstance;
}

// Export db as a getter that creates the instance lazily
// This allows the module to be imported without DATABASE_URL in development
// The db will only be created when actually used (i.e., when DrizzleStorage is instantiated)
export const db = new Proxy({} as NeonHttpDatabase<typeof schema>, {
  get(_target, prop) {
    const db = createDb();
    const value = (db as any)[prop];
    return typeof value === "function" ? value.bind(db) : value;
  },
});

// Export schema for use in other files
export { schema };

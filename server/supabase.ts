import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { logger } from "./logger";

// Lazy initialization - only create client when actually used
let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!_supabase) {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      // Only throw error in production
      if (process.env.NODE_ENV === "production") {
        throw new Error(
          "SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias em produção. Configure as variáveis de ambiente no arquivo .env"
        );
      }
      // In development, throw a helpful error when trying to use
      throw new Error(
        "SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY não configuradas. Configure as variáveis de ambiente no arquivo .env\n" +
        "Em desenvolvimento, você pode usar MemStorage sem Supabase."
      );
    }

    // Create Supabase client for backend (server-side)
    // Uses SERVICE_ROLE_KEY which bypasses RLS - use with caution!
    _supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }
  return _supabase;
}

// Export supabase as a getter that initializes on first use
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabase();
    const value = client[prop as keyof SupabaseClient];
    // If it's a function, bind it to the client
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});

// Helper function to get user from JWT token
export async function getUserFromToken(token: string) {
  try {
    const client = getSupabase();
    const { data: { user }, error } = await client.auth.getUser(token);
    
    if (error) {
      logger.warn({ err: error, msg: "Failed to get user from token" });
      return null;
    }
    
    return user;
  } catch (error: unknown) {
    // In development, if Supabase is not configured, return null gracefully
    if (error.message?.includes("SUPABASE_URL") && process.env.NODE_ENV !== "production") {
      logger.warn({ msg: "Supabase not configured, returning null for getUserFromToken" });
      return null;
    }
    logger.error({ err: error, msg: "Error getting user from token" });
    return null;
  }
}

// Helper function to verify JWT token
export async function verifyToken(token: string) {
  try {
    const client = getSupabase();
    const { data: { user }, error } = await client.auth.getUser(token);
    return { user, error };
  } catch (error: unknown) {
    // In development, if Supabase is not configured, return error gracefully
    if (error.message?.includes("SUPABASE_URL") && process.env.NODE_ENV !== "production") {
      return { user: null, error: new Error("Supabase not configured") };
    }
    return { user: null, error };
  }
}


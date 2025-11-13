import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Get Supabase URL and anon key from environment
// In production, these should be set as environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Lazy initialization - only create client when actually used
let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!_supabase) {
    if (!supabaseUrl || !supabaseAnonKey) {
      // Only throw error in production
      if (import.meta.env.PROD) {
        throw new Error(
          "Supabase URL and Anon Key must be configured in production. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file."
        );
      }
      // In development, create a mock client that fails gracefully
      console.warn("Supabase not configured. Creating mock client for development.");
      _supabase = createClient(
        "https://placeholder.supabase.co",
        "placeholder-key",
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false,
          },
        }
      );
      return _supabase;
    }

    // Create Supabase client for frontend (client-side)
    // Uses ANON_KEY which respects RLS policies
    _supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });
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

// Helper to get current user
export async function getCurrentUser() {
  try {
    const client = getSupabase();
    const { data: { user }, error } = await client.auth.getUser();
    return { user, error };
  } catch (error: unknown) {
    // In development, if Supabase is not configured, return null gracefully
    if (error && typeof error === 'object' && 'message' in error &&
        typeof error.message === 'string' && error.message.includes("Supabase") &&
        !import.meta.env.PROD) {
      console.warn("Supabase not configured, returning null user");
      return { user: null, error: null };
    }
    return { user: null, error };
  }
}

// Helper to get current session
export async function getCurrentSession() {
  try {
    const client = getSupabase();
    const { data: { session }, error } = await client.auth.getSession();
    return { session, error };
  } catch (error: unknown) {
    // In development, if Supabase is not configured, return null gracefully
    if (error && typeof error === 'object' && 'message' in error &&
        typeof error.message === 'string' && error.message.includes("Supabase") &&
        !import.meta.env.PROD) {
      console.warn("Supabase not configured, returning null session");
      return { session: null, error: null };
    }
    return { session: null, error };
  }
}

// Helper to sign out
export async function signOut() {
  try {
    const client = getSupabase();
    const { error } = await client.auth.signOut();
    return { error };
  } catch (error: unknown) {
    // In development, if Supabase is not configured, return no error
    if (error && typeof error === 'object' && 'message' in error &&
        typeof error.message === 'string' && error.message.includes("Supabase") &&
        !import.meta.env.PROD) {
      return { error: null };
    }
    return { error };
  }
}


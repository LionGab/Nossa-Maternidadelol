/**
 * Authentication utilities for managing JWT tokens
 */

const TOKEN_KEY = "supabase_auth_token";
const USER_KEY = "auth_user";

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  expires_at?: number;
}

/**
 * Store authentication token and user
 */
export function setAuth(session: AuthSession, user: AuthUser): void {
  try {
    localStorage.setItem(TOKEN_KEY, session.access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    
    // Store refresh token if available
    if (session.refresh_token) {
      localStorage.setItem(`${TOKEN_KEY}_refresh`, session.refresh_token);
    }
    
    // Store expiration if available
    if (session.expires_at) {
      localStorage.setItem(`${TOKEN_KEY}_expires_at`, session.expires_at.toString());
    }
  } catch (error) {
    console.error("Failed to store auth:", error);
  }
}

/**
 * Get authentication token
 */
export function getAuthToken(): string | null {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    
    // Check if token is expired
    const expiresAt = localStorage.getItem(`${TOKEN_KEY}_expires_at`);
    if (expiresAt) {
      const expiresAtMs = parseInt(expiresAt, 10) * 1000; // Convert to milliseconds
      if (Date.now() >= expiresAtMs) {
        // Token expired, clear it
        clearAuth();
        return null;
      }
    }
    
    return token;
  } catch (error) {
    console.error("Failed to get auth token:", error);
    return null;
  }
}

/**
 * Get authenticated user
 */
export function getAuthUser(): AuthUser | null {
  try {
    const userJson = localStorage.getItem(USER_KEY);
    if (!userJson) return null;
    return JSON.parse(userJson) as AuthUser;
  } catch (error) {
    console.error("Failed to get auth user:", error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}

/**
 * Clear authentication
 */
export function clearAuth(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(`${TOKEN_KEY}_refresh`);
    localStorage.removeItem(`${TOKEN_KEY}_expires_at`);
    localStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error("Failed to clear auth:", error);
  }
}

/**
 * Get authorization header for API requests
 */
export function getAuthHeader(): Record<string, string> {
  const token = getAuthToken();
  if (!token) return {};
  
  return {
    Authorization: `Bearer ${token}`,
  };
}


/**
 * React Query configuration
 * Otimizado para performance e UX mobile-first
 */

import { QueryClient } from "@tanstack/react-query";

/**
 * Configurações de query por tipo de dado
 */
export const QUERY_CONFIG = {
  // Dados estáticos (mudam raramente)
  static: {
    staleTime: 60 * 60 * 1000, // 1 hora
    gcTime: 24 * 60 * 60 * 1000, // 24 horas
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  },

  // Dados dinâmicos (mudam com frequência média)
  dynamic: {
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  },

  // Dados em tempo real (sempre fresh)
  realtime: {
    staleTime: 0,
    gcTime: 1 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  },

  // Dados do usuário
  user: {
    staleTime: 2 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  },
} as const;

/**
 * Cliente React Query otimizado
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

/**
 * Helper para fazer chamadas à API com tratamento de erros
 */
export async function apiRequest(
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  url: string,
  data?: any
): Promise<any> {
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Include cookies for session auth
  };

  if (data && method !== "GET") {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: `Request failed with status ${response.status}`,
    }));
    throw new Error(error.error || error.message || "Request failed");
  }

  return response.json();
}

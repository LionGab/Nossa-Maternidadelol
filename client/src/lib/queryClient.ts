import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { getAuthHeader } from "./auth";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Get auth token and include in headers
  const authHeaders = getAuthHeader();
  const headers: Record<string, string> = {
    ...authHeaders,
    ...(data ? { "Content-Type": "application/json" } : {}),
  };

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include", // Also send cookies for session-based auth
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

// Enhanced query function that handles path params and query strings
const enhancedQueryFn: QueryFunction = async ({ queryKey }) => {
  let url = queryKey[0] as string;
  
  // Handle additional parameters in queryKey
  if (queryKey.length > 1) {
    const params = queryKey.slice(1);
    
    // Check if it's a query params object
    if (params.length === 1 && typeof params[0] === 'object' && !Array.isArray(params[0])) {
      const searchParams = new URLSearchParams();
      Object.entries(params[0] as Record<string, unknown>).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== 'all') {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url = `${url}?${queryString}`;
      }
    } else {
      // Path parameters - join them to the URL
      url = queryKey.join('/');
    }
  }
  
  // Get auth token and include in headers
  const authHeaders = getAuthHeader();
  const res = await fetch(url, { 
    headers: authHeaders,
    credentials: "include", // Also send cookies for session-based auth
  });
  
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
  
  return res.json();
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: enhancedQueryFn,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutos padrão
      gcTime: 10 * 60 * 1000, // 10 minutos (antes era cacheTime)
      retry: (failureCount, error: unknown) => {
        // Não retry em erros 4xx (client errors)
        if (error instanceof Error && error.message.startsWith('4')) {
          return false;
        }
        return failureCount < 2; // Retry até 2 vezes
      },
    },
    mutations: {
      retry: false,
    },
  },
});

/**
 * Query configurations by data type
 */
export const queryConfigs = {
  // Dados que mudam raramente (posts, conteúdo)
  static: {
    staleTime: 30 * 60 * 1000, // 30 minutos
    gcTime: 60 * 60 * 1000, // 1 hora
  },
  
  // Dados que mudam frequentemente (habits, stats)
  dynamic: {
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 5 * 60 * 1000, // 5 minutos
  },
  
  // Dados em tempo real (mensagens AI)
  realtime: {
    staleTime: 0,
    refetchInterval: 2000, // 2 segundos
    gcTime: 2 * 60 * 1000, // 2 minutos
  },
} as const;

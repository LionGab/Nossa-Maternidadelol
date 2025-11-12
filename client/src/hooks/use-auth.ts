import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, getCurrentUser, getCurrentSession, signOut } from "@/lib/supabase";
import { apiRequest } from "@/lib/queryClient";
import type { User } from "@supabase/supabase-js";

export interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
}

export function useAuth() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Get current session
  const { data: session } = useQuery({
    queryKey: ["auth", "session"],
    queryFn: async () => {
      const { session } = await getCurrentSession();
      return session;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get current user
  const { data: supabaseUser } = useQuery({
    queryKey: ["auth", "user"],
    queryFn: async () => {
      const { user } = await getCurrentUser();
      return user;
    },
    enabled: !!session,
    staleTime: 5 * 60 * 1000,
  });

  // Sync user state
  useEffect(() => {
    if (supabaseUser) {
      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email || "",
        emailVerified: !!supabaseUser.email_confirmed_at,
      });
    } else {
      setUser(null);
    }
    setLoading(false);
  }, [supabaseUser]);

  // Listen to auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      queryClient.setQueryData(["auth", "session"], session);
      if (session?.user) {
        queryClient.setQueryData(["auth", "user"], session.user);
      } else {
        queryClient.setQueryData(["auth", "user"], null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  // Sign up mutation
  const signUpMutation = useMutation({
    mutationFn: async ({
      email,
      password,
      name,
      stage,
      goals,
    }: {
      email: string;
      password: string;
      name: string;
      stage: string;
      goals?: string[];
    }) => {
      const response = await apiRequest("POST", "/api/auth/register", {
        email,
        password,
        name,
        stage,
        goals: goals || [],
      });
      const data = await response.json();
      
      // Set session if provided
      if (data.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });

  // Sign in mutation
  const signInMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await apiRequest("POST", "/api/auth/login", {
        email,
        password,
      });
      const data = await response.json();
      
      // Set session if provided
      if (data.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });

  // Sign out mutation
  const signOutMutation = useMutation({
    mutationFn: async () => {
      await signOut();
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["auth", "user"], null);
      queryClient.setQueryData(["auth", "session"], null);
      queryClient.clear();
    },
  });

  return {
    user,
    loading,
    isAuthenticated: !!user,
    signUp: signUpMutation.mutateAsync,
    signIn: signInMutation.mutateAsync,
    signOut: signOutMutation.mutateAsync,
    isSigningUp: signUpMutation.isPending,
    isSigningIn: signInMutation.isPending,
    isSigningOut: signOutMutation.isPending,
  };
}


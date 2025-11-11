// Auth Service - Supabase Authentication
// Serviço completo de autenticação com email, phone, OTP e OAuth

import { supabase } from './supabase';

// ==========================================
// TYPES
// ==========================================

export interface SignUpData {
  email?: string;
  phone?: string;
  password: string;
  metadata?: Record<string, any>;
}

export interface SignInData {
  email?: string;
  phone?: string;
  password?: string;
}

export interface VerifyOtpData {
  email?: string;
  phone?: string;
  token: string;
  type: 'email' | 'sms' | 'magiclink';
}

// ==========================================
// EMAIL / PASSWORD AUTH
// ==========================================

/**
 * Sign up com email e senha
 */
export const signUpWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

/**
 * Sign in com email e senha
 */
export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

// ==========================================
// EMAIL OTP (Magic Link)
// ==========================================

/**
 * Enviar magic link por email
 */
export const signInWithEmailOtp = async (email: string) => {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
  });

  if (error) throw error;
  return data;
};

/**
 * Verificar OTP de email
 */
export const verifyEmailOtp = async (email: string, token: string) => {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  });

  if (error) throw error;
  return data;
};

// ==========================================
// PHONE / SMS AUTH
// ==========================================

/**
 * Sign up com telefone e senha
 */
export const signUpWithPhone = async (phone: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    phone,
    password,
  });

  if (error) throw error;
  return data;
};

/**
 * Enviar OTP por SMS
 */
export const signInWithPhoneOtp = async (phone: string) => {
  const { data, error } = await supabase.auth.signInWithOtp({
    phone,
  });

  if (error) throw error;
  return data;
};

/**
 * Verificar OTP de SMS
 */
export const verifyPhoneOtp = async (phone: string, token: string) => {
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms',
  });

  if (error) throw error;
  return data;
};

// ==========================================
// OAUTH / SOCIAL LOGIN
// ==========================================

/**
 * Sign in com OAuth (Google, GitHub, Facebook, etc)
 */
export const signInWithOAuth = async (provider: 'google' | 'github' | 'facebook' | 'apple') => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: 'nossa-maternidade://auth/callback',
    },
  });

  if (error) throw error;
  return data;
};

// ==========================================
// PASSWORD RECOVERY
// ==========================================

/**
 * Enviar email de recuperação de senha
 */
export const resetPasswordForEmail = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email);

  if (error) throw error;
  return data;
};

/**
 * Atualizar senha do usuário
 */
export const updatePassword = async (newPassword: string) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) throw error;
  return data;
};

// ==========================================
// USER MANAGEMENT
// ==========================================

/**
 * Obter usuário atual
 */
export const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  return user;
};

/**
 * Obter sessão atual
 */
export const getCurrentSession = async () => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) throw error;
  return session;
};

/**
 * Atualizar dados do usuário
 */
export const updateUser = async (updates: { email?: string; password?: string; data?: Record<string, any> }) => {
  const { data, error } = await supabase.auth.updateUser(updates);

  if (error) throw error;
  return data;
};

/**
 * Sign out
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) throw error;
};

// ==========================================
// AUTH STATE LISTENER
// ==========================================

/**
 * Observar mudanças no estado de autenticação
 */
export const onAuthStateChange = (callback: (session: any) => void) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session);
  });
};

// ==========================================
// ANONYMOUS AUTH (Fallback)
// ==========================================

/**
 * Sign in anônimo (para onboarding rápido)
 */
export const signInAnonymously = async () => {
  const { data, error } = await supabase.auth.signInAnonymously();

  if (error) throw error;
  return data;
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Verificar se usuário está autenticado
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const session = await getCurrentSession();
  return !!session;
};

/**
 * Obter ID do usuário atual
 */
export const getCurrentUserId = async (): Promise<string | null> => {
  const user = await getCurrentUser();
  return user?.id || null;
};

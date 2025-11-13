import type { Express } from "express";
import { storage } from "./storage";
import { supabase } from "./supabase";
import { z } from "zod";
import { authLimiter } from "./rate-limit";
import { logger } from "./logger";

const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  stage: z.enum(["pregnant", "postpartum", "planning"] as const, {
    message: "Estágio deve ser: pregnant, postpartum ou planning",
  }),
  goals: z.array(z.string()).optional(),
});

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

/**
 * Register authentication routes
 */
export function registerAuthRoutes(app: Express) {
  // Register new user
  app.post("/api/auth/register", authLimiter, async (req, res) => {
    try {
      // Validate input
      const validation = registerSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: "Dados inválidos",
          details: validation.error.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        });
      }

      const { email, password, name, stage, goals } = validation.data;

      // Check if user already exists in our database
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        // Generic message to prevent user enumeration
        return res.status(400).json({
          error: "Não foi possível criar a conta. Verifique os dados e tente novamente.",
        });
      }

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            stage,
            goals: goals || [],
          },
        },
      });

      if (authError) {
        logger.error({ err: authError, msg: "Supabase signup error" });
        // Generic error message
        return res.status(400).json({
          error: "Não foi possível criar a conta. Verifique os dados e tente novamente.",
        });
      }

      if (!authData.user) {
        return res.status(500).json({
          error: "Erro ao criar conta. Tente novamente.",
        });
      }

      const userId = authData.user.id;

      // Create user in our database (for compatibility with existing code)
      // Note: Supabase Auth handles password hashing, so we don't store passwordHash
      // Use the userId from Supabase Auth to keep them in sync
      const user = await storage.createUser({
        id: userId, // Use Supabase Auth user ID
        email,
        passwordHash: "", // Not used with Supabase Auth, but required by schema
      });

      // Create profile
      await storage.createProfile({
        userId: user.id,
        name,
        stage,
        goals: goals || [],
      });

      // Create subscription (trial by default)
      await storage.createSubscription({
        userId: user.id,
        status: "trial",
        trialUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      });

      // Initialize user stats
      await storage.createOrUpdateUserStats(user.id, 0, false);

      // Return session tokens from Supabase
      return res.status(201).json({
        message: "Cadastro realizado com sucesso!",
        user: {
          id: user.id,
          email: user.email,
        },
        session: authData.session, // Supabase session with access_token and refresh_token
      });
    } catch (error) {
      logger.error({ err: error, msg: "Registration error" });
      return res.status(500).json({
        error: "Erro ao criar conta. Tente novamente.",
      });
    }
  });

  // Login
  app.post("/api/auth/login", authLimiter, async (req, res) => {
    try {
      // Validate input
      const validation = loginSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: "Dados inválidos",
          details: validation.error.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        });
      }

      const { email, password } = validation.data;

      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !authData.user) {
        // Generic error message to prevent user enumeration
        return res.status(401).json({
          error: "Email ou senha incorretos",
        });
      }

      // Get user from our database
      const dbUser = await storage.getUser(authData.user.id);
      if (!dbUser) {
        logger.warn({ userId: authData.user.id, msg: "User in Supabase Auth but not in database" });
        return res.status(401).json({
          error: "Usuário não encontrado no sistema.",
        });
      }

      // Update last login
      await storage.updateUserLastLogin(authData.user.id);

      // Return session tokens from Supabase
      return res.json({
        message: "Login realizado com sucesso!",
        user: {
          id: authData.user.id,
          email: authData.user.email,
        },
        session: authData.session, // Supabase session with access_token and refresh_token
      });
    } catch (error) {
      logger.error({ err: error, msg: "Login error" });
      return res.status(500).json({
        error: "Erro ao fazer login. Tente novamente.",
      });
    }
  });

  // Logout
  app.post("/api/auth/logout", async (req, res) => {
    try {
      // Get token from request
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

      if (token) {
        // Sign out from Supabase
        await supabase.auth.signOut();
      }

      return res.json({
        message: "Logout realizado com sucesso!",
      });
    } catch (error) {
      logger.error({ err: error, msg: "Logout error" });
      // Still return success even if there's an error
      return res.json({
        message: "Logout realizado com sucesso!",
      });
    }
  });

  // Get current user
  app.get("/api/auth/me", async (req, res) => {
    try {
      // Extract token
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

      if (!token) {
        return res.status(401).json({
          error: "Não autenticado",
        });
      }

      // Verify token and get user
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        return res.status(401).json({
          error: "Não autenticado",
        });
      }

      // Get user from our database
      const dbUser = await storage.getUser(user.id);
      if (!dbUser) {
        return res.status(401).json({
          error: "Usuário não encontrado",
        });
      }

      return res.json({
        id: user.id,
        email: user.email,
        emailVerified: user.email_confirmed_at !== null,
      });
    } catch (error) {
      logger.error({ err: error, msg: "Get current user error" });
      return res.status(401).json({
        error: "Não autenticado",
      });
    }
  });

  // Check authentication status
  app.get("/api/auth/status", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

      if (!token) {
        return res.json({
          authenticated: false,
        });
      }

      const { data: { user }, error } = await supabase.auth.getUser(token);

      return res.json({
        authenticated: !error && !!user,
      });
    } catch (error) {
      return res.json({
        authenticated: false,
      });
    }
  });
}

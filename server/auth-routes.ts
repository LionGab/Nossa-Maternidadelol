import type { Express } from "express";
import passport from "passport";
import { storage } from "./storage";
import { hashPassword } from "./auth";
import { z } from "zod";
import { authLimiter } from "./rate-limit";
import { logger } from "./logger";

const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  stage: z.enum(["pregnant", "postpartum", "planning"], {
    errorMap: () => ({ message: "Estágio deve ser: pregnant, postpartum ou planning" }),
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
  app.post("/api/auth/register", authLimiter, async (req, res, next) => {
    try {
      // Validate input
      const validation = registerSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: "Dados inválidos",
          details: validation.error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        });
      }

      const { email, password, name, stage, goals } = validation.data;

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          error: "Este email já está cadastrado",
        });
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Create user
      const user = await storage.createUser({
        email,
        passwordHash,
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

      // Log user in automatically
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }

        return res.status(201).json({
          message: "Cadastro realizado com sucesso!",
          user: {
            id: user.id,
            email: user.email,
          },
        });
      });
    } catch (error) {
      logger.error({ err: error, msg: "Registration error" });
      return res.status(500).json({
        error: "Erro ao criar conta. Tente novamente.",
      });
    }
  });

  // Login
  app.post("/api/auth/login", authLimiter, (req, res, next) => {
    // Validate input
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: "Dados inválidos",
        details: validation.error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }

    passport.authenticate("local", (err: any, user: Express.User | false, info: any) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.status(401).json({
          error: info?.message || "Email ou senha incorretos",
        });
      }

      req.login(user, (err) => {
        if (err) {
          return next(err);
        }

        return res.json({
          message: "Login realizado com sucesso!",
          user: {
            id: (user as any).id,
            email: (user as any).email,
          },
        });
      });
    })(req, res, next);
  });

  // Logout
  app.post("/api/auth/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }

      req.session.destroy((err) => {
        if (err) {
          return next(err);
        }

        res.clearCookie("connect.sid");
        return res.json({
          message: "Logout realizado com sucesso!",
        });
      });
    });
  });

  // Get current user
  app.get("/api/auth/me", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        error: "Não autenticado",
      });
    }

    const user = req.user as any;
    return res.json({
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
    });
  });

  // Check authentication status
  app.get("/api/auth/status", (req, res) => {
    return res.json({
      authenticated: req.isAuthenticated(),
    });
  });
}

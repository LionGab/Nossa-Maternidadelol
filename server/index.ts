// Load environment variables from .env file
import { readFileSync } from "fs";
import { join } from "path";
try {
  const envPath = join(process.cwd(), ".env");
  const envFile = readFileSync(envPath, "utf-8");
  envFile.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...valueParts] = trimmed.split("=");
      if (key && valueParts.length > 0) {
        const value = valueParts.join("=").trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  });
} catch (error) {
  // .env file not found or can't be read - that's okay, use system env vars
}

import express, { type Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import { registerRoutes } from "./routes/index";
import { registerAuthRoutes } from "./auth-routes";
import { setupAuth } from "./auth";
import { setupVite, serveStatic } from "./vite";
import { logger, requestLogger, errorLogger, logStartup } from "./logger";
import { storage } from "./storage";
import { metricsMiddleware, getMetricsHandler } from "./metrics";

const app = express();

// Security headers (Helmet)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Required for Tailwind
      styleSrcElem: ["'self'", "'unsafe-inline'"], // Explicitly allow inline styles for Tailwind/Vite
      scriptSrc: ["'self'", "'unsafe-inline'"], // Required for Vite in dev
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Required for some assets
}));

// CORS configuration
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',')
  : ['http://localhost:5000', 'http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Compression middleware
app.use(compression());

// Trust proxy (required for secure cookies behind reverse proxy)
if (process.env.NODE_ENV === "production") {
  app.set('trust proxy', 1);
}

// Extend Express User type
declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      emailVerified: boolean;
    }
  }
}

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}

app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

// Validate critical environment variables
const isProduction = process.env.NODE_ENV === "production";

// GEMINI_API_KEY is required in all environments (agents won't work without it)
if (!process.env.GEMINI_API_KEY) {
  const error = new Error("GEMINI_API_KEY é obrigatório. Configure a variável de ambiente no arquivo .env");
  if (isProduction) {
    throw error;
  } else {
    logger.warn({ 
      msg: "GEMINI_API_KEY não configurada. Agentes não funcionarão até que seja configurada.",
      hint: "Obtenha uma API key em: https://aistudio.google.com/app/apikey"
    });
  }
} else {
  logger.info({ 
    msg: "Google Gemini API configurada",
    apiKey: process.env.GEMINI_API_KEY.substring(0, 10) + "...",
    note: "Usando API direta do Google Gemini (não Replit)"
  });
}

// Production-only validations
if (isProduction) {
  if (!process.env.SUPABASE_URL) {
    throw new Error("SUPABASE_URL é obrigatório em produção");
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY é obrigatório em produção");
  }
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL é obrigatório em produção");
  }
} else {
  // Development mode - using MemStorage (in-memory database)
  logger.info({
    msg: "Modo desenvolvimento - usando MemStorage (dados em memória)",
    note: "Dados serão perdidos ao reiniciar o servidor. Para persistência, configure DATABASE_URL"
  });
}

// Initialize Supabase Auth (no-op, kept for compatibility)
setupAuth(app);

// Demo user disabled - use proper authentication
// app.use(autoDemoLogin(storage));

// Metrics middleware (before request logger)
app.use(metricsMiddleware);

// Request logging middleware
app.use(requestLogger);

(async () => {
  // Import health check handlers
  const { livenessHandler, readinessHandler, integrationsHandler } = await import("./health");

  // Health check endpoints (before auth for monitoring)
  app.get("/health", livenessHandler); // Liveness probe (is app running?)
  app.get("/health/live", livenessHandler); // Kubernetes liveness probe
  app.get("/health/ready", readinessHandler); // Readiness probe (can serve traffic?)
  app.get("/health/integrations", integrationsHandler); // Detailed integration status

  // Metrics endpoint (before auth for monitoring)
  app.get("/metrics", getMetricsHandler);

  // Register authentication routes
  registerAuthRoutes(app);

  // Register application routes
  const server = await registerRoutes(app);

  // Error logging middleware (before error handler)
  app.use(errorLogger);
  
  // Error handler is registered in routes/index.ts via registerRoutesSync

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);

  // Use localhost on Windows to avoid ENOTSUP errors
  const isWindows = process.platform === 'win32';
  const listenOptions: { port: number; host: string; reusePort?: boolean } = {
    port,
    host: isWindows ? 'localhost' : '0.0.0.0',
  };

  // reusePort is not supported on Windows
  if (!isWindows) {
    listenOptions.reusePort = true;
  }

  server.listen(listenOptions, () => {
    logStartup(port, process.env.NODE_ENV || "development");
  });
})();

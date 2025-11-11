import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import { registerRoutes } from "../server/routes";
import { registerAuthRoutes } from "../server/auth-routes";
import { setupAuth } from "../server/auth";
import { logger, requestLogger, errorLogger } from "../server/logger";
import { autoDemoLogin } from "../server/demo-user";
import { storage } from "../server/storage";

const app = express();

// Security headers (Helmet) - Adjusted for Vercel
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      styleSrcElem: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',')
  : ['https://nossa-maternidadelol.vercel.app'];

app.use(cors({
  origin: (origin, callback) => {
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

// Trust proxy (required for Vercel)
app.set('trust proxy', 1);

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
if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
  throw new Error(
    "SESSION_SECRET é obrigatório e deve ter no mínimo 32 caracteres. " +
    "Configure em: Vercel Dashboard → Project Settings → Environment Variables"
  );
}

// Session configuration for Vercel (using MemoryStore - not recommended for production multi-instance)
const sessionSecret = process.env.SESSION_SECRET || "nossa-maternidade-dev-secret-change-in-production";
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true, // Always HTTPS on Vercel
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      sameSite: "lax",
    },
  })
);

// Initialize Passport
setupAuth(app);

// Auto-login demo user if not authenticated
app.use(autoDemoLogin(storage));

// Request logging middleware
app.use(requestLogger);

// Register authentication routes
registerAuthRoutes(app);

// Register application routes (async IIFE to handle async registerRoutes)
(async () => {
  try {
    await registerRoutes(app);
  } catch (error) {
    logger.error({ error, msg: "Failed to register routes" });
  }
})();

// Error logging middleware
app.use(errorLogger);

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({ message });
});

// Export for Vercel serverless
export default app;

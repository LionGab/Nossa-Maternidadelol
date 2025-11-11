import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import { registerRoutes } from "./routes";
import { registerAuthRoutes } from "./auth-routes";
import { setupAuth } from "./auth";
import { setupVite, serveStatic } from "./vite";
import { logger, requestLogger, errorLogger, logStartup } from "./logger";
import { autoDemoLogin } from "./demo-user";
import { storage } from "./storage";

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

// Validate critical environment variables in production
if (process.env.NODE_ENV === "production") {
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
    throw new Error(
      "SESSION_SECRET é obrigatório em produção e deve ter no mínimo 32 caracteres. " +
      "Gere um com: openssl rand -base64 32"
    );
  }
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL é obrigatório em produção");
  }
}

// Session configuration
const sessionSecret = process.env.SESSION_SECRET || "nossa-maternidade-dev-secret-change-in-production";
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      sameSite: "lax",
    },
  })
);

// Initialize Passport
setupAuth(app);

// Auto-login demo user if not authenticated (enables site to work without login page)
app.use(autoDemoLogin(storage));

// Request logging middleware
app.use(requestLogger);

(async () => {
  // Register authentication routes
  registerAuthRoutes(app);

  // Register application routes
  const server = await registerRoutes(app);

  // Error logging middleware
  app.use(errorLogger);

  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
  });

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
  const listenOptions: any = {
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

import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";
import { logger } from "./logger";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  logger.info({ msg: message, source });
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);

  // Serve HTML for all routes that are not assets or API calls (SPA fallback)
  app.use(async (req, res, next) => {
    // Only handle GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const url = req.originalUrl;

    // Skip if it's an asset request (let Vite middleware handle it)
    if (url.match(/\.(png|jpg|jpeg|gif|svg|ico|json|css|js|woff|woff2|ttf|eot|map)$/)) {
      return next();
    }

    // Skip API routes
    if (url.startsWith("/api/") || url.startsWith("/health")) {
      return next();
    }

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // Serve index.html for all routes that are not assets or API calls (SPA fallback)
  app.use((req, res, next) => {
    // Only handle GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip if it's an asset request (already served by express.static)
    if (req.url.match(/\.(png|jpg|jpeg|gif|svg|ico|json|css|js|woff|woff2|ttf|eot|map)$/)) {
      return next();
    }

    // Skip API routes
    if (req.url.startsWith("/api/") || req.url.startsWith("/health")) {
      return next();
    }

    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

/**
 * Upload Routes - File uploads (avatar, content)
 */

import type { Express } from "express";
import { requireAuth } from "../auth";
import { logger } from "../logger";
import type { AuthenticatedRequest } from "../types";
import { uploadFile, validateFileType, validateFileSize } from "../storage-upload";
import { UPLOAD } from "../constants";

export function registerUploadRoutes(app: Express): void {
  // File Upload Routes (protected)
  // Note: For now, these routes accept base64 encoded files
  // In production, use proper multipart/form-data with multer
  app.post("/api/upload/avatar", requireAuth, async (req, res, next) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const { file, filename, contentType } = req.body;

      if (!file || !filename) {
        return res.status(400).json({ error: "Arquivo não fornecido" });
      }

      // Validate file type
      if (!validateFileType(filename, UPLOAD.AVATAR_ALLOWED_TYPES)) {
        return res.status(400).json({
          error: `Tipo de arquivo não permitido. Use: ${UPLOAD.AVATAR_ALLOWED_TYPES.join(", ").toUpperCase()}`,
        });
      }

      // Decode base64 file
      const fileBuffer = Buffer.from(file, "base64");

      // Validate file size
      if (!validateFileSize(fileBuffer.length, UPLOAD.AVATAR_MAX_SIZE)) {
        return res.status(400).json({
          error: `Arquivo muito grande. Máximo: ${UPLOAD.AVATAR_MAX_SIZE / (1024 * 1024)}MB`,
        });
      }

      // Generate unique filename
      const extension = filename.split(".").pop();
      const uniqueFilename = `${userId}/${Date.now()}.${extension}`;

      // Upload to Supabase Storage
      const result = await uploadFile(
        UPLOAD.AVATAR_BUCKET,
        uniqueFilename,
        fileBuffer,
        contentType || UPLOAD.DEFAULT_CONTENT_TYPE,
        {
          upsert: false,
          cacheControl: String(UPLOAD.CACHE_CONTROL_SECONDS),
        }
      );

      res.json({
        url: result.publicUrl,
        path: result.path,
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/upload/content", requireAuth, async (req, res, next) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const { file, filename, contentType } = req.body;

      if (!file || !filename) {
        return res.status(400).json({ error: "Arquivo não fornecido" });
      }

      // Validate file type
      if (!validateFileType(filename, UPLOAD.CONTENT_ALLOWED_TYPES)) {
        return res.status(400).json({
          error: `Tipo de arquivo não permitido. Use: ${UPLOAD.CONTENT_ALLOWED_TYPES.join(", ").toUpperCase()}`,
        });
      }

      // Decode base64 file
      const fileBuffer = Buffer.from(file, "base64");

      // Validate file size
      if (!validateFileSize(fileBuffer.length, UPLOAD.CONTENT_MAX_SIZE)) {
        return res.status(400).json({
          error: `Arquivo muito grande. Máximo: ${UPLOAD.CONTENT_MAX_SIZE / (1024 * 1024)}MB`,
        });
      }

      // Generate unique filename
      const extension = filename.split(".").pop();
      const uniqueFilename = `${userId}/${Date.now()}.${extension}`;

      // Upload to Supabase Storage
      const result = await uploadFile(
        UPLOAD.CONTENT_BUCKET,
        uniqueFilename,
        fileBuffer,
        contentType || UPLOAD.DEFAULT_CONTENT_TYPE,
        {
          upsert: false,
          cacheControl: String(UPLOAD.CACHE_CONTROL_SECONDS),
        }
      );

      res.json({
        url: result.publicUrl,
        path: result.path,
      });
    } catch (error) {
      next(error);
    }
  });
}

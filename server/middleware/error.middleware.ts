/**
 * Centralized Error Handling Middleware
 */

import type { Request, Response, NextFunction } from "express";
import { logger } from "../logger";

/**
 * Custom application error class
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

/**
 * Centralized error handler middleware
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    logger.warn({
      err,
      path: req.path,
      method: req.method,
      status: err.statusCode,
      code: err.code,
      msg: "Client error",
    });
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    });
  }
  
  logger.error({
    err,
    path: req.path,
    method: req.method,
    msg: "Server error",
  });
  
  res.status(500).json({
    error: "Erro interno do servidor",
    code: "INTERNAL_ERROR",
  });
}

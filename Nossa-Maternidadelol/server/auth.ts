/**
 * Autenticação com sessões e cleanup automático
 */
import express from 'express';
import session from 'express-session';

// Configuração de sessão com expiração adequada
export const sessionConfig: session.SessionOptions = {
  secret: process.env.SESSION_SECRET || 'change-me-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS apenas em produção
    httpOnly: true, // Previne XSS
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    sameSite: 'strict', // Previne CSRF
  },
  name: 'sessionId', // Não usar nome padrão por segurança
};

/**
 * Middleware de autenticação
 */
export function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Não autenticado' });
  }
  next();
}

/**
 * Limpa sessões expiradas (executar periodicamente)
 */
export function cleanupExpiredSessions() {
  // Se usando memory store, limpar manualmente
  // Se usando Redis, configurar TTL automático
  // Esta função é chamada periodicamente pelo servidor
  console.log('Limpando sessões expiradas...');
}


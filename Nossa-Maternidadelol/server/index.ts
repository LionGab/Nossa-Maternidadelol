/**
 * Servidor principal com todas as melhorias implementadas
 */
import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import routes from './routes.js';
import { getHealthStatus } from './health.js';
import { initializeCache } from './cache.js';
import { sessionConfig, cleanupExpiredSessions } from './auth.js';
import { startCleanupJob } from './jobs/cleanup-orphaned-files.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: '10mb' })); // Limite para body parser
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(session(sessionConfig));

// CORS básico (ajustar conforme necessário)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Tratamento de erros global
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erro não tratado:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Rotas
app.use(routes);

/**
 * GET /api/health
 * Health check robusto
 */
app.get('/api/health', async (req, res) => {
  try {
    const health = await getHealthStatus();
    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    console.error('Erro no health check:', error);
    res.status(503).json({ 
      status: 'unhealthy', 
      error: 'Health check failed' 
    });
  }
});

// Inicializar servidor
async function startServer() {
  try {
    // Inicializar cache ANTES de usar
    await initializeCache();

    // Iniciar job de limpeza de arquivos órfãos
    startCleanupJob();

    // Limpar sessões expiradas a cada hora
    if (typeof setInterval !== 'undefined') {
      setInterval(cleanupExpiredSessions, 60 * 60 * 1000);
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`✅ Servidor rodando na porta ${PORT}`);
      console.log(`🔍 Health check disponível em http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Erro ao inicializar servidor:', error);
    process.exit(1);
  }
}

startServer();


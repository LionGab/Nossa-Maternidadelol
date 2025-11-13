#!/usr/bin/env node

/**
 * Setup script for Nossa Maternidade
 * Checks environment, installs dependencies, and validates configuration
 */

import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

console.log('🚀 Configurando Nossa Maternidade...\n');

// Check Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
if (majorVersion < 20) {
  console.error('❌ Node.js 20+ é necessário. Versão atual:', nodeVersion);
  process.exit(1);
}
console.log('✅ Node.js version:', nodeVersion);

// Check if .env exists
const envPath = join(__dirname, '..', '.env');
if (!existsSync(envPath)) {
  console.log('📝 Criando arquivo .env.example...');
  const envExample = `# Database
DATABASE_URL=postgresql://user:password@localhost:5432/nossa_maternidade

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key

# AI APIs
GEMINI_API_KEY=your-gemini-api-key
PERPLEXITY_API_KEY=your-perplexity-api-key

# Session
SESSION_SECRET=$(node scripts/generate-session-secret.js)

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Environment
NODE_ENV=development
PORT=5000
`;
  writeFileSync(join(__dirname, '..', '.env.example'), envExample);
  console.log('⚠️  Arquivo .env não encontrado. Crie um baseado em .env.example');
}

// Check package.json
const packagePath = join(__dirname, '..', 'package.json');
if (!existsSync(packagePath)) {
  console.error('❌ package.json não encontrado');
  process.exit(1);
}

console.log('✅ Configuração básica verificada');
console.log('\n📦 Execute "npm install" para instalar dependências');
console.log('📝 Configure as variáveis de ambiente no arquivo .env');
console.log('🚀 Execute "npm run dev" para iniciar o servidor de desenvolvimento\n');

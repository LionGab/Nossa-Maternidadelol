#!/usr/bin/env node

/**
 * Pre-Deploy Validation Script
 * Nossa Maternidade
 *
 * Verifica se o projeto está pronto para deploy em produção
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function info(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function section(title) {
  log(`\n${'='.repeat(60)}`, 'blue');
  log(title.toUpperCase(), 'bold');
  log('='.repeat(60), 'blue');
}

// Checks
let hasErrors = false;
let hasWarnings = false;

function runCheck(description, checkFn) {
  try {
    const result = checkFn();
    if (result === true) {
      success(description);
    } else if (result === 'warning') {
      warning(description);
      hasWarnings = true;
    } else {
      error(description);
      hasErrors = true;
    }
  } catch (err) {
    error(`${description}: ${err.message}`);
    hasErrors = true;
  }
}

// ============================================
// CHECK 1: Node.js Version
// ============================================
section('Verificando Ambiente de Desenvolvimento');

runCheck('Node.js >= 20.0.0', () => {
  const version = process.version;
  const major = parseInt(version.slice(1).split('.')[0]);
  if (major >= 20) {
    info(`  Versão detectada: ${version}`);
    return true;
  }
  error(`  Versão atual: ${version} (mínimo: v20.0.0)`);
  return false;
});

// ============================================
// CHECK 2: npm Version
// ============================================
runCheck('npm >= 10.0.0', () => {
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf-8' }).trim();
    const major = parseInt(npmVersion.split('.')[0]);
    if (major >= 10) {
      info(`  Versão detectada: ${npmVersion}`);
      return true;
    }
    error(`  Versão atual: ${npmVersion} (mínimo: 10.0.0)`);
    return false;
  } catch {
    return false;
  }
});

// ============================================
// CHECK 3: Dependencies Installed
// ============================================
runCheck('node_modules instalado', () => {
  return existsSync('node_modules');
});

// ============================================
// CHECK 4: TypeScript Check
// ============================================
section('Verificando Qualidade do Código');

runCheck('TypeScript type check passa', () => {
  try {
    execSync('npm run check', { stdio: 'pipe' });
    return true;
  } catch {
    error('  Execute: npm run check para ver erros');
    return false;
  }
});

// ============================================
// CHECK 5: Build Success
// ============================================
runCheck('Build completa com sucesso', () => {
  try {
    info('  Executando build... (pode levar ~30s)');
    execSync('npm run build', { stdio: 'pipe' });
    return true;
  } catch {
    error('  Execute: npm run build para ver erros');
    return false;
  }
});

// ============================================
// CHECK 6: Build Artifacts
// ============================================
runCheck('Artefatos de build gerados', () => {
  const hasClient = existsSync('dist/public/index.html');
  const hasServer = existsSync('dist/index.js');

  if (!hasClient) {
    error('  dist/public/index.html não encontrado');
  }
  if (!hasServer) {
    error('  dist/index.js não encontrado');
  }

  return hasClient && hasServer;
});

// ============================================
// CHECK 7: Required Files
// ============================================
section('Verificando Arquivos de Configuração');

const requiredFiles = [
  'package.json',
  'vercel.json',
  'api/index.ts',
  'shared/schema.ts',
  'drizzle.config.ts',
  '.gitignore',
  'tsconfig.json',
  'vite.config.ts',
];

requiredFiles.forEach(file => {
  runCheck(`Arquivo ${file} existe`, () => existsSync(file));
});

// ============================================
// CHECK 8: Environment Variables
// ============================================
section('Verificando Variáveis de Ambiente');

const requiredEnvVars = [
  'DATABASE_URL',
  'SESSION_SECRET',
  'GEMINI_API_KEY',
  'PERPLEXITY_API_KEY',
];

runCheck('.env.example existe', () => existsSync('.env.example'));

runCheck('.env não está commitado', () => {
  if (existsSync('.env')) {
    try {
      execSync('git ls-files .env', { stdio: 'pipe' });
      error('  .env está no git! Remova: git rm --cached .env');
      return false;
    } catch {
      // .env não está no git (esperado)
      return true;
    }
  }
  warning('  .env não encontrado (esperado em dev local)');
  return 'warning';
});

info('\nVariáveis obrigatórias para produção:');
requiredEnvVars.forEach(envVar => {
  const hasVar = process.env[envVar];
  if (hasVar) {
    success(`  ${envVar} definida`);
  } else {
    warning(`  ${envVar} não definida (necessária na Vercel)`);
    hasWarnings = true;
  }
});

// ============================================
// CHECK 9: SESSION_SECRET Security
// ============================================
runCheck('SESSION_SECRET suficientemente forte', () => {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    warning('  Não definida localmente (OK se configurada na Vercel)');
    return 'warning';
  }
  if (secret.length < 32) {
    error(`  Muito curta: ${secret.length} chars (mínimo: 32)`);
    error('  Gere nova: openssl rand -base64 32');
    return false;
  }
  success(`  Segura: ${secret.length} chars`);
  return true;
});

// ============================================
// CHECK 10: Git Status
// ============================================
section('Verificando Controle de Versão');

runCheck('Git instalado', () => {
  try {
    execSync('git --version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
});

runCheck('Repositório Git inicializado', () => {
  return existsSync('.git');
});

runCheck('Branch atual', () => {
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
    info(`  Branch: ${branch}`);

    if (branch === 'claude/monte-um-p-011CV56F4x3QfXuo7HcfBfXk') {
      warning('  Em branch do Claude - faça merge para main antes do deploy');
      return 'warning';
    }

    return true;
  } catch {
    return false;
  }
});

runCheck('Mudanças commitadas', () => {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf-8' });
    if (status.trim().length === 0) {
      success('  Working directory limpo');
      return true;
    }
    warning('  Há mudanças não commitadas:');
    info(status);
    return 'warning';
  } catch {
    return false;
  }
});

// ============================================
// CHECK 11: Vercel Configuration
// ============================================
section('Verificando Configuração Vercel');

runCheck('vercel.json válido', () => {
  try {
    const vercelConfig = JSON.parse(readFileSync('vercel.json', 'utf-8'));

    if (!vercelConfig.builds) {
      error('  vercel.json sem "builds"');
      return false;
    }

    if (!vercelConfig.rewrites) {
      error('  vercel.json sem "rewrites"');
      return false;
    }

    success('  Configuração válida');
    return true;
  } catch (err) {
    error(`  Erro ao parsear vercel.json: ${err.message}`);
    return false;
  }
});

runCheck('api/index.ts existe (serverless function)', () => {
  return existsSync('api/index.ts');
});

// ============================================
// CHECK 12: Database Schema
// ============================================
section('Verificando Database');

runCheck('Schema Drizzle válido', () => {
  try {
    execSync('npx tsc shared/schema.ts --noEmit', { stdio: 'pipe' });
    return true;
  } catch {
    error('  shared/schema.ts tem erros de tipo');
    return false;
  }
});

runCheck('drizzle.config.ts válido', () => {
  return existsSync('drizzle.config.ts');
});

info('\n⚠️  Migrations devem ser executadas após deploy:');
info('   npm run db:push');

// ============================================
// CHECK 13: Security Headers
// ============================================
section('Verificando Segurança');

runCheck('Helmet configurado (server/index.ts)', () => {
  try {
    const serverCode = readFileSync('server/index.ts', 'utf-8');
    return serverCode.includes('helmet');
  } catch {
    return false;
  }
});

runCheck('Rate limiting configurado', () => {
  return existsSync('server/rate-limit.ts');
});

runCheck('Input validation configurado', () => {
  return existsSync('server/validation.ts');
});

runCheck('Security headers em vercel.json', () => {
  try {
    const vercelConfig = JSON.parse(readFileSync('vercel.json', 'utf-8'));
    const hasSecurityHeaders = vercelConfig.headers?.some(h =>
      h.headers?.some(header =>
        ['X-Content-Type-Options', 'X-Frame-Options', 'X-XSS-Protection'].includes(header.key)
      )
    );
    return hasSecurityHeaders || false;
  } catch {
    return false;
  }
});

// ============================================
// CHECK 14: GitHub Actions
// ============================================
section('Verificando CI/CD');

const workflows = [
  '.github/workflows/ci.yml',
  '.github/workflows/deploy.yml',
];

workflows.forEach(workflow => {
  runCheck(`Workflow ${workflow} existe`, () => existsSync(workflow));
});

info('\n⚠️  GitHub Secrets necessários para CI/CD:');
const requiredSecrets = [
  'DATABASE_URL',
  'SESSION_SECRET',
  'GEMINI_API_KEY',
  'PERPLEXITY_API_KEY',
  'VERCEL_TOKEN',
  'VERCEL_ORG_ID',
  'VERCEL_PROJECT_ID',
];
requiredSecrets.forEach(secret => {
  info(`   - ${secret}`);
});

// ============================================
// SUMMARY
// ============================================
section('Resumo da Verificação');

if (hasErrors) {
  error('\n❌ PRÉ-DEPLOY FALHOU - Corrija os erros acima antes de fazer deploy');
  error('\nPara mais informações, consulte:');
  info('  - PLANO_DEPLOY_PRODUCAO.md');
  info('  - DEPLOY_CHECKLIST.md');
  process.exit(1);
} else if (hasWarnings) {
  warning('\n⚠️  PRÉ-DEPLOY PASSOU COM AVISOS - Revise os avisos acima');
  info('\nVocê pode prosseguir com o deploy, mas considere resolver os avisos.');
  info('\nPróximos passos:');
  info('  1. Configurar variáveis de ambiente na Vercel');
  info('  2. Executar deploy: vercel --prod');
  info('  3. Rodar migrations: npm run db:push');
  info('  4. Configurar DNS');
  info('\nGuia completo: PLANO_DEPLOY_PRODUCAO.md');
  process.exit(0);
} else {
  success('\n✅ PRÉ-DEPLOY PASSOU - Projeto pronto para produção!');
  info('\nPróximos passos:');
  info('  1. Configurar variáveis de ambiente na Vercel');
  info('  2. Executar deploy: vercel --prod');
  info('  3. Rodar migrations: npm run db:push');
  info('  4. Configurar DNS');
  info('\nGuia completo: PLANO_DEPLOY_PRODUCAO.md');
  info('Checklist rápido: DEPLOY_CHECKLIST.md');
  process.exit(0);
}

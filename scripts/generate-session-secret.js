#!/usr/bin/env node
/**
 * Script para gerar SESSION_SECRET seguro para produção
 * 
 * Uso:
 *   node scripts/generate-session-secret.js
 * 
 * Ou via npm:
 *   npm run generate:session-secret
 */

import crypto from 'crypto';

// Gera um secret seguro de 32 bytes (256 bits) em base64
const secret = crypto.randomBytes(32).toString('base64');

console.log('\n✅ SESSION_SECRET gerado com sucesso!\n');
console.log('📋 Copie e cole este valor no Vercel Dashboard:\n');
console.log('─'.repeat(60));
console.log(secret);
console.log('─'.repeat(60));
console.log('\n📍 Onde configurar:');
console.log('   Vercel Dashboard → Project Settings → Environment Variables');
console.log('   Nome: SESSION_SECRET');
console.log('   Valor: (cole o valor acima)');
console.log('   Ambientes: Production, Preview, Development\n');


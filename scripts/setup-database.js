#!/usr/bin/env node
/**
 * Script de setup automático do banco de dados
 * Valida conexão e executa migrations
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';

console.log('🗄️  Setup do Banco de Dados - Nossa Maternidade\n');

// Check if DATABASE_URL is configured
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL não configurada!');
  console.log('\n📋 Passos para configurar:\n');
  console.log('1. Copie .env.local.example para .env.local');
  console.log('2. Acesse https://supabase.com/dashboard');
  console.log('3. Vá em Settings → Database');
  console.log('4. Copie a "Connection string" (Connection pooling)');
  console.log('5. Cole no arquivo .env.local na variável DATABASE_URL');
  console.log('6. Substitua [YOUR_PASSWORD] pela senha real\n');
  process.exit(1);
}

console.log('✅ DATABASE_URL configurada');

// Validate DATABASE_URL format
if (!databaseUrl.startsWith('postgresql://')) {
  console.error('❌ DATABASE_URL deve começar com postgresql://');
  process.exit(1);
}

console.log('✅ Formato da URL válido');

// Test database connection
console.log('\n🔍 Testando conexão com o banco de dados...');

try {
  // Simple connection test using node-postgres
  const { Client } = await import('pg');
  const client = new Client({ connectionString: databaseUrl });

  await client.connect();
  console.log('✅ Conexão estabelecida com sucesso!');

  // Get database info
  const result = await client.query('SELECT version(), current_database(), current_user');
  console.log(`\n📊 Informações do banco:`);
  console.log(`   Database: ${result.rows[0].current_database}`);
  console.log(`   User: ${result.rows[0].current_user}`);
  console.log(`   Version: ${result.rows[0].version.split(' ')[0]} ${result.rows[0].version.split(' ')[1]}`);

  await client.end();
} catch (error) {
  console.error('\n❌ Erro ao conectar ao banco de dados:');
  console.error(error.message);
  console.log('\n💡 Dicas:');
  console.log('   - Verifique se a senha está correta');
  console.log('   - Confirme que o banco está ativo no Supabase');
  console.log('   - Use connection pooling (porta 6543) para melhor performance');
  process.exit(1);
}

// Run Drizzle migrations
console.log('\n📦 Executando migrations com Drizzle Kit...\n');

try {
  execSync('npm run db:push', { stdio: 'inherit' });
  console.log('\n✅ Migrations executadas com sucesso!');
} catch (error) {
  console.error('\n❌ Erro ao executar migrations');
  console.error(error.message);
  process.exit(1);
}

console.log('\n🎉 Setup do banco de dados concluído com sucesso!');
console.log('\n📝 Próximos passos:');
console.log('   1. Execute: npm run dev');
console.log('   2. Teste o app em: http://localhost:5000');
console.log('   3. Verifique se os dados persistem após restart\n');

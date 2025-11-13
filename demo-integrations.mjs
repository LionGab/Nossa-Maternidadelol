#!/usr/bin/env node

/**
 * Demo Script - Mostra as melhorias de integração em ação
 *
 * Execute: node demo-integrations.mjs
 */

const SERVER_URL = 'http://localhost:5000';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'bright');
  console.log('='.repeat(60) + '\n');
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkHealth() {
  section('📊 HEALTH CHECKS');

  try {
    log('1. Verificando liveness (app está vivo?)...', 'cyan');
    const liveness = await fetch(`${SERVER_URL}/health`);
    const livenessData = await liveness.json();

    if (livenessData.status === 'alive') {
      log('   ✅ App está vivo!', 'green');
      log(`   ⏱️  Uptime: ${Math.floor(livenessData.uptime)}s`, 'cyan');
    } else {
      log('   ❌ App não está respondendo', 'red');
    }

    await delay(1000);

    log('\n2. Verificando readiness (pode servir tráfego?)...', 'cyan');
    const readiness = await fetch(`${SERVER_URL}/health/ready`);
    const readinessData = await readiness.json();

    log(`   Status: ${readinessData.status}`, readinessData.status === 'healthy' ? 'green' : 'yellow');

    await delay(1000);

    log('\n3. Verificando status de integrações...', 'cyan');
    const integrations = await fetch(`${SERVER_URL}/health/integrations`);
    const intData = await integrations.json();

    log('\n   Integrações:', 'bright');
    for (const check of intData.checks) {
      const statusIcon = check.status === 'healthy' ? '✅' :
                        check.status === 'degraded' ? '⚠️' : '❌';
      const statusColor = check.status === 'healthy' ? 'green' :
                         check.status === 'degraded' ? 'yellow' : 'red';

      log(`   ${statusIcon} ${check.name}:`, statusColor);
      log(`      Status: ${check.status}`, statusColor);
      log(`      Latency: ${check.latencyMs}ms`, 'cyan');
      log(`      Message: ${check.message}`, 'cyan');
    }

    log('\n   Circuit Breakers:', 'bright');
    for (const [name, stats] of Object.entries(intData.circuitBreakers)) {
      const stateIcon = stats.state === 'CLOSED' ? '🟢' :
                       stats.state === 'HALF_OPEN' ? '🟡' : '🔴';
      const stateColor = stats.state === 'CLOSED' ? 'green' :
                        stats.state === 'HALF_OPEN' ? 'yellow' : 'red';

      log(`   ${stateIcon} ${name}:`, stateColor);
      log(`      State: ${stats.state}`, stateColor);
      log(`      Failures: ${stats.failureCount}/${stats.failureThreshold}`, 'cyan');
    }

    log('\n✅ Health checks concluídos!', 'green');

  } catch (error) {
    log(`❌ Erro ao verificar health: ${error.message}`, 'red');
    log('\n⚠️  Certifique-se de que o servidor está rodando:', 'yellow');
    log('   npm run dev', 'cyan');
  }
}

async function demonstrateRetry() {
  section('🔄 RETRY LOGIC DEMONSTRATION');

  log('Este é um exemplo de como o retry funciona:', 'cyan');
  log('- Tenta 3 vezes total (1 inicial + 2 retries)', 'cyan');
  log('- Espera 1s, depois 2s entre tentativas (exponential backoff)', 'cyan');
  log('- Adiciona jitter para prevenir thundering herd\n', 'cyan');

  let attempt = 0;
  const flakyFunction = async () => {
    attempt++;
    log(`   Tentativa ${attempt}...`, 'cyan');

    if (attempt < 3) {
      await delay(200);
      throw new Error('Falha temporária (simulada)');
    }

    await delay(200);
    return 'Sucesso!';
  };

  try {
    log('Executando função com retry...', 'bright');

    for (let i = 0; i < 3; i++) {
      try {
        const result = await flakyFunction();
        log(`   ✅ ${result}`, 'green');
        break;
      } catch (error) {
        if (i < 2) {
          const delay = Math.pow(2, i) * 1000;
          log(`   ⚠️  Retry ${i + 1} após erro: ${error.message}`, 'yellow');
          log(`   ⏱️  Aguardando ${delay}ms antes de tentar novamente...`, 'cyan');
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          throw error;
        }
      }
    }

    log('\n✅ Retry logic demonstrado com sucesso!', 'green');

  } catch (error) {
    log(`❌ Falhou após todas as tentativas: ${error.message}`, 'red');
  }
}

async function demonstrateCircuitBreaker() {
  section('🛑 CIRCUIT BREAKER DEMONSTRATION');

  log('Este é um exemplo de como o circuit breaker funciona:', 'cyan');
  log('- CLOSED: Normal operation, requests passam', 'green');
  log('- OPEN: Após 3-5 falhas, fail-fast (não chama API)', 'red');
  log('- HALF_OPEN: Após 30-60s, testa se API recuperou', 'yellow');
  log('- Volta para CLOSED após 2 sucessos consecutivos\n', 'green');

  log('Estados atuais:', 'bright');

  try {
    const response = await fetch(`${SERVER_URL}/health/integrations`);
    const data = await response.json();

    for (const [name, stats] of Object.entries(data.circuitBreakers)) {
      const emoji = stats.state === 'CLOSED' ? '🟢' :
                   stats.state === 'HALF_OPEN' ? '🟡' : '🔴';

      log(`${emoji} ${name}: ${stats.state} (${stats.failureCount} failures)`, 'cyan');
    }

    log('\n💡 Dica: Para testar o circuit breaker abrindo:', 'yellow');
    log('   1. Remova/invalide a GEMINI_API_KEY', 'cyan');
    log('   2. Faça 5 requests de chat que vão falhar', 'cyan');
    log('   3. O circuit abrirá automaticamente', 'cyan');
    log('   4. Verifique em /health/integrations', 'cyan');

  } catch (error) {
    log(`❌ Erro: ${error.message}`, 'red');
  }
}

async function demonstrateTimeout() {
  section('⏱️  TIMEOUT DEMONSTRATION');

  log('Timeouts configurados:', 'cyan');
  log('- Gemini (NathIA): 15 segundos', 'cyan');
  log('- Perplexity (MãeValente): 10 segundos\n', 'cyan');

  log('Se uma API demorar mais que o timeout:', 'yellow');
  log('- Request é cancelado automaticamente (AbortSignal)', 'cyan');
  log('- Usuário recebe mensagem friendly', 'cyan');
  log('- Previne requests travados indefinidamente', 'cyan');
  log('- Circuit breaker pode abrir se timeouts constantes\n', 'cyan');

  log('💡 Exemplo de mensagem de timeout:', 'yellow');
  log('   "Desculpe, a resposta está demorando muito."', 'cyan');
  log('   "Tente uma pergunta mais simples?"', 'cyan');
}

async function showMonitoringTips() {
  section('📊 DICAS DE MONITORAMENTO');

  log('Endpoints disponíveis:', 'bright');
  log(`\n1. Liveness Probe:`, 'cyan');
  log(`   GET ${SERVER_URL}/health`, 'yellow');
  log(`   Kubernetes: livenessProbe`, 'cyan');

  log(`\n2. Readiness Probe:`, 'cyan');
  log(`   GET ${SERVER_URL}/health/ready`, 'yellow');
  log(`   Kubernetes: readinessProbe`, 'cyan');

  log(`\n3. Status Detalhado:`, 'cyan');
  log(`   GET ${SERVER_URL}/health/integrations`, 'yellow');
  log(`   Veja no navegador para JSON formatado`, 'cyan');

  log(`\n4. Métricas Prometheus:`, 'cyan');
  log(`   GET ${SERVER_URL}/metrics`, 'yellow');
  log(`   Para integrar com Grafana/Prometheus`, 'cyan');

  log('\n\nMonitoramento em tempo real:', 'bright');
  log('   Terminal 1: npm run dev', 'yellow');
  log('   Terminal 2: watch -n 2 "curl -s localhost:5000/health/integrations | jq"', 'yellow');

  log('\n\nLogs estruturados no terminal do servidor:', 'bright');
  log('   - Retry attempts com delays', 'cyan');
  log('   - Circuit breaker state changes', 'cyan');
  log('   - API call durations e métricas', 'cyan');
  log('   - Errors com circuit state', 'cyan');
}

async function main() {
  log('\n' + '█'.repeat(60), 'bright');
  log('█' + ' '.repeat(58) + '█', 'bright');
  log('█' + '  🚀 DEMO: MELHORIAS DE INTEGRAÇÃO'.padEnd(59) + '█', 'bright');
  log('█' + '  Nossa Maternidade - Resiliência em Ação'.padEnd(59) + '█', 'bright');
  log('█' + ' '.repeat(58) + '█', 'bright');
  log('█'.repeat(60) + '\n', 'bright');

  // Verificar se servidor está rodando
  try {
    await fetch(`${SERVER_URL}/health`);
  } catch (error) {
    log('❌ Servidor não está rodando!', 'red');
    log('\nPor favor, inicie o servidor primeiro:', 'yellow');
    log('   npm run dev\n', 'cyan');
    process.exit(1);
  }

  await checkHealth();
  await delay(2000);

  await demonstrateRetry();
  await delay(2000);

  await demonstrateCircuitBreaker();
  await delay(2000);

  await demonstrateTimeout();
  await delay(2000);

  await showMonitoringTips();

  section('🎉 DEMO COMPLETO');
  log('Agora você pode:', 'bright');
  log('  ✅ Verificar health checks em tempo real', 'green');
  log('  ✅ Ver circuit breakers em ação', 'green');
  log('  ✅ Testar retry logic com APIs reais', 'green');
  log('  ✅ Monitorar timeouts e métricas', 'green');
  log('  ✅ Integrar com Kubernetes/Docker', 'green');

  log('\n📖 Para mais detalhes, veja:', 'cyan');
  log('   COMO_TESTAR_INTEGRACOES.md', 'yellow');
  log('   INTEGRACAO_ANALISE.md\n', 'yellow');
}

main().catch(console.error);

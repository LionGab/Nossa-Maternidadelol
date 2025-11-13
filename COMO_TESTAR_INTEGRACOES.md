# 🧪 Como Testar as Melhorias de Integrações

**Guia Prático** - Veja o retry, circuit breaker e health checks em ação!

---

## 🚀 Início Rápido

### 1. Iniciar o Servidor

```bash
# Terminal 1 - Inicie o servidor
npm run dev

# Aguarde a mensagem:
# ✓ Server listening on http://localhost:5000
```

---

## 📊 Testar Health Checks

### 1.1 Health Check Básico

```bash
# Verificar se o app está vivo
curl http://localhost:5000/health

# Resposta esperada:
{
  "status": "alive",
  "timestamp": "2025-01-13T17:30:00.000Z",
  "uptime": 123.45
}
```

### 1.2 Readiness Check (Pode Servir Tráfego?)

```bash
# Verificar se pode servir requisições
curl http://localhost:5000/health/ready

# Resposta esperada (dev mode com MemStorage):
{
  "status": "degraded",  # "degraded" é normal em dev sem DATABASE_URL
  "timestamp": "2025-01-13T17:30:00.000Z",
  "uptime": 123.45,
  "checks": [
    {
      "name": "gemini_ai",
      "status": "healthy",      # ✅ ou "degraded" se sem API key
      "message": "API key configured",
      "latencyMs": 5,
      "lastCheck": "2025-01-13T17:30:00.000Z"
    },
    {
      "name": "perplexity_ai",
      "status": "healthy",
      "message": "API key configured",
      "latencyMs": 3,
      "lastCheck": "2025-01-13T17:30:00.000Z"
    },
    {
      "name": "supabase",
      "status": "degraded",     # Normal em dev
      "message": "Not configured (using MemStorage in dev)",
      "latencyMs": 2,
      "lastCheck": "2025-01-13T17:30:00.000Z"
    },
    {
      "name": "database",
      "status": "degraded",     # Normal em dev
      "message": "Using MemStorage (in-memory database)",
      "latencyMs": 1,
      "lastCheck": "2025-01-13T17:30:00.000Z"
    }
  ],
  "circuitBreakers": {
    "gemini_ai": {
      "state": "CLOSED",        # ✅ Normal
      "failureCount": 0,
      "failureThreshold": 5,
      "successCount": 0,
      "lastOpenTime": 0
    },
    "perplexity_ai": {
      "state": "CLOSED",
      "failureCount": 0,
      "failureThreshold": 3,
      "successCount": 0,
      "lastOpenTime": 0
    }
  }
}
```

### 1.3 Status Detalhado de Integrações

```bash
# Ver status completo
curl http://localhost:5000/health/integrations | jq

# O 'jq' formata o JSON (instale com: sudo apt-get install jq)
# Ou veja no navegador: http://localhost:5000/health/integrations
```

---

## 🔄 Testar Retry Logic

### 2.1 Criar Script de Teste

Crie o arquivo `test-retry.mjs`:

```bash
cat > test-retry.mjs << 'EOF'
import { retryWithBackoff, fetchWithRetry } from './server/utils/retry.ts';

console.log('🧪 Testando Retry Logic\n');

// Teste 1: Função que falha 2 vezes e depois sucede
let attempt = 0;
const flakyFunction = async () => {
  attempt++;
  console.log(`  Tentativa ${attempt}...`);

  if (attempt < 3) {
    throw new Error('Falha temporária');
  }

  return 'Sucesso!';
};

try {
  console.log('📌 Teste 1: Retry com sucesso na 3ª tentativa');
  const result = await retryWithBackoff(flakyFunction, {
    maxRetries: 3,
    baseDelay: 500,
    onRetry: (error, attempt) => {
      console.log(`  ⚠️  Retry ${attempt} após erro: ${error.message}`);
    }
  });
  console.log(`  ✅ Resultado: ${result}\n`);
} catch (error) {
  console.log(`  ❌ Falhou: ${error.message}\n`);
}

// Teste 2: Fetch com retry
console.log('📌 Teste 2: Fetch real com retry');
try {
  const response = await fetchWithRetry(
    'https://httpbin.org/status/500', // Simula erro 500
    {},
    { maxRetries: 2, baseDelay: 500 }
  );
  console.log('  ✅ Sucesso (improvável)');
} catch (error) {
  console.log(`  ✅ Esperado: Falhou após 3 tentativas (1 + 2 retries)`);
  console.log(`     Error: ${error.message}\n`);
}

console.log('✅ Testes de Retry Concluídos!');
EOF

# Executar teste
node test-retry.mjs
```

**Saída Esperada:**
```
🧪 Testando Retry Logic

📌 Teste 1: Retry com sucesso na 3ª tentativa
  Tentativa 1...
  ⚠️  Retry 1 após erro: Falha temporária
  Tentativa 2...
  ⚠️  Retry 2 após erro: Falha temporária
  Tentativa 3...
  ✅ Resultado: Sucesso!

📌 Teste 2: Fetch real com retry
  ✅ Esperado: Falhou após 3 tentativas (1 + 2 retries)
     Error: HTTP 500: Internal Server Error

✅ Testes de Retry Concluídos!
```

---

## 🛑 Testar Circuit Breaker

### 3.1 Simular Falhas para Abrir o Circuit

```bash
# No navegador ou com curl, faça 5 requests que vão falhar
# (assumindo que GEMINI_API_KEY não está configurada ou é inválida)

# Terminal 2 - Execute rapidamente 5 vezes:
for i in {1..5}; do
  curl -X POST http://localhost:5000/api/ai/chat \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer seu_token_aqui" \
    -d '{"message":"teste","sessionId":"test-session"}' &
done

# Aguarde algumas falhas (se API key inválida)
```

### 3.2 Verificar Estado do Circuit Breaker

```bash
# Após 5 falhas, o circuit deve abrir
curl http://localhost:5000/health/integrations | jq '.circuitBreakers'

# Resposta esperada após falhas:
{
  "gemini_ai": {
    "state": "OPEN",           # 🔴 Circuit ABERTO!
    "failureCount": 5,
    "failureThreshold": 5,
    "successCount": 0,
    "lastOpenTime": 1705167000000
  }
}
```

### 3.3 Ver Circuit Breaker em Ação

```bash
# Quando circuit está OPEN, requests falham imediatamente (fail-fast)
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer seu_token_aqui" \
  -d '{"message":"teste","sessionId":"test-session"}'

# Resposta esperada:
{
  "message": "A NathIA está temporariamente indisponível. Tente novamente em alguns instantes."
}

# Após 60 segundos (resetTimeout), o circuit vai para HALF_OPEN
# e tentará novamente
```

---

## ⏱️ Testar Timeouts

### 4.1 Gemini Timeout (15s)

```bash
# Se você tiver GEMINI_API_KEY configurada:
# Faça uma pergunta muito complexa para testar o timeout

curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer seu_token_aqui" \
  -d '{
    "message": "Me explique em detalhes completos sobre...[mensagem muito longa]",
    "sessionId": "test-session"
  }'

# Se demorar mais de 15s, receberá:
{
  "message": "Desculpe, a resposta está demorando muito. Tente uma pergunta mais simples?"
}
```

### 4.2 Perplexity Timeout (10s)

```bash
# Similar para Perplexity (MãeValente)
curl -X POST http://localhost:5000/api/ai/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer seu_token_aqui" \
  -d '{"question":"Pergunta complexa aqui"}'

# Timeout após 10s com mensagem:
{
  "error": "A busca demorou muito tempo. Tente uma pergunta mais específica."
}
```

---

## 📝 Verificar Logs Estruturados

### 5.1 Ver Logs em Tempo Real

```bash
# Terminal 1 (onde o servidor está rodando)
# Os logs aparecem automaticamente com informações detalhadas:

# Exemplo de log de retry:
{
  "level": "warn",
  "msg": "Retrying after error",
  "attempt": 1,
  "maxRetries": 3,
  "delayMs": 1000,
  "error": "fetch failed"
}

# Exemplo de log de circuit breaker:
{
  "level": "info",
  "msg": "Circuit breaker state changed",
  "circuit": "gemini_ai",
  "oldState": "CLOSED",
  "newState": "OPEN",
  "failureCount": 5
}

# Exemplo de log de API call bem-sucedida:
{
  "level": "info",
  "service": "perplexity",
  "duration": 1234,
  "questionLength": 50,
  "citationsCount": 3,
  "msg": "Perplexity search completed"
}
```

---

## 🎯 Script de Teste Completo

Crie `test-integrations.sh`:

```bash
cat > test-integrations.sh << 'EOF'
#!/bin/bash

echo "🧪 Testando Melhorias de Integrações"
echo "====================================="
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se servidor está rodando
if ! curl -s http://localhost:5000/health > /dev/null; then
  echo -e "${RED}❌ Servidor não está rodando!${NC}"
  echo "Execute: npm run dev"
  exit 1
fi

echo -e "${GREEN}✅ Servidor está rodando${NC}"
echo ""

# Teste 1: Health Check
echo "📊 Teste 1: Health Checks"
echo "-------------------------"
echo "Liveness:"
curl -s http://localhost:5000/health | jq '.status'

echo ""
echo "Readiness:"
curl -s http://localhost:5000/health/ready | jq '{status, uptime}'

echo ""
echo "Circuit Breakers:"
curl -s http://localhost:5000/health/integrations | jq '.circuitBreakers'

echo ""
echo -e "${GREEN}✅ Health checks funcionando${NC}"
echo ""

# Teste 2: Verificar logs
echo "📝 Teste 2: Logs Estruturados"
echo "-----------------------------"
echo "Verifique o terminal do servidor para ver logs em tempo real"
echo ""

# Teste 3: Métricas
echo "📈 Teste 3: Métricas"
echo "--------------------"
if curl -s http://localhost:5000/metrics > /dev/null; then
  echo -e "${GREEN}✅ Endpoint /metrics disponível${NC}"
else
  echo -e "${YELLOW}⚠️  Métricas requerem configuração adicional${NC}"
fi

echo ""
echo "🎉 Testes Concluídos!"
echo ""
echo "📖 Próximos passos:"
echo "  1. Abra http://localhost:5000/health/integrations no navegador"
echo "  2. Teste a NathIA (chat) para ver retry em ação"
echo "  3. Teste a MãeValente (busca) para ver timeouts"
echo "  4. Monitore os logs no terminal do servidor"
EOF

chmod +x test-integrations.sh
./test-integrations.sh
```

---

## 🌐 Testar no Navegador

### Via Interface Web

1. **Abra o app:** http://localhost:5000

2. **Faça login ou crie conta**

3. **Teste NathIA (Chat):**
   - Vá para página NathIA
   - Envie várias mensagens rapidamente
   - Observe os logs no terminal para ver retry

4. **Teste MãeValente (Busca):**
   - Vá para página MãeValente
   - Faça uma busca
   - Se API estiver lenta, verá timeout funcionando

5. **Monitore Health:**
   - Abra nova aba: http://localhost:5000/health/integrations
   - Recarregue para ver estados atualizados

---

## 🔍 O Que Observar

### ✅ Sinais de que está funcionando:

**Retry Logic:**
```
[17:30:00] WARN: Retrying after error
  attempt: 1
  maxRetries: 3
  delayMs: 1000
```

**Circuit Breaker:**
```
[17:30:05] INFO: Circuit breaker state changed
  circuit: "gemini_ai"
  oldState: "CLOSED"
  newState: "OPEN"
  failureCount: 5
```

**Timeout:**
```
[17:30:10] ERROR: Gemini API Error
  error: "Request timeout"
  duration: 15000
  circuitState: "CLOSED"
```

**Sucesso Após Retry:**
```
[17:30:15] INFO: Perplexity search completed
  duration: 2500
  citationsCount: 3
```

---

## 🎓 Cenários de Teste Avançados

### Cenário 1: Simular API Lenta

```javascript
// Adicione um delay artificial (apenas para testes)
// Em server/gemini.ts, adicione antes do ai.models.generateContent:

await new Promise(resolve => setTimeout(resolve, 20000)); // 20s

// Teste: Deve dar timeout em 15s
```

### Cenário 2: Forçar Circuit Aberto

```bash
# Desabilite a API key temporariamente para forçar falhas
export GEMINI_API_KEY=""

# Faça 5 requests
# Circuit abrirá automaticamente
```

### Cenário 3: Ver Recuperação Automática

```bash
# 1. Abra o circuit (5 falhas)
# 2. Aguarde 60 segundos (resetTimeout)
# 3. Circuit vai para HALF_OPEN
# 4. Próximo request bem-sucedido fecha o circuit
# 5. Verifique em /health/integrations
```

---

## 📊 Monitoramento Contínuo

### Dashboard Simples (Terminal)

```bash
# Em outro terminal, monitore em tempo real:
watch -n 2 'curl -s http://localhost:5000/health/integrations | jq "{
  status,
  gemini: .circuitBreakers.gemini_ai.state,
  perplexity: .circuitBreakers.perplexity_ai.state,
  checks: [.checks[] | {name, status}]
}"'

# Atualiza a cada 2 segundos
```

---

## 🎉 Conclusão

**Você agora pode ver:**
- ✅ Health checks em tempo real
- ✅ Circuit breaker mudando estados
- ✅ Retry logic tentando novamente
- ✅ Timeouts protegendo requests lentos
- ✅ Logs estruturados com métricas
- ✅ Recuperação automática de falhas

**Endpoints Úteis:**
- `http://localhost:5000/health` - Liveness
- `http://localhost:5000/health/ready` - Readiness
- `http://localhost:5000/health/integrations` - Status completo
- `http://localhost:5000/metrics` - Métricas Prometheus

**Logs:** Sempre visíveis no terminal onde `npm run dev` está rodando!

🚀 **Suas integrações agora são resilientes!**

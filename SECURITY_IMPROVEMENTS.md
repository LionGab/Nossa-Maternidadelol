# Melhorias de Segurança Implementadas

Este documento descreve as melhorias de segurança críticas implementadas no projeto Nossa Maternidade.

## ✅ Implementado

### 1. Validação de SESSION_SECRET em Produção

**Arquivo:** `server/index.ts:34-45`

Adicionada validação que impede o servidor de iniciar em produção sem variáveis críticas configuradas:

```typescript
if (process.env.NODE_ENV === "production") {
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
    throw new Error(
      "SESSION_SECRET é obrigatório em produção e deve ter no mínimo 32 caracteres. " +
      "Gere um com: openssl rand -base64 32"
    );
  }
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL é obrigatório em produção");
  }
}
```

**Benefícios:**
- ✅ Previne vazamento de secret padrão em produção
- ✅ Garante secret forte (mínimo 32 caracteres)
- ✅ Fail-fast: erro na inicialização, não em runtime

---

### 2. Rate Limiting Granular

**Arquivo:** `server/rate-limit.ts`

Implementados 4 limitadores diferentes para proteção contra abuso:

#### a) AI Chat Limiter (NathIA)
- **Limite:** 10 requisições/minuto por usuário
- **Rotas:** `/api/nathia/chat`
- **Razão:** Proteger contra consumo excessivo de API Gemini (paga)

#### b) AI Search Limiter (MãeValente)
- **Limite:** 5 requisições/minuto por usuário
- **Rotas:** `/api/mae-valente/search`
- **Razão:** API Perplexity é mais cara, limite mais restritivo

#### c) Auth Limiter
- **Limite:** 5 tentativas/15 minutos por IP
- **Rotas:** `/api/auth/login`, `/api/auth/register`
- **Razão:** Prevenir brute force e criação massiva de contas

#### d) General API Limiter (disponível para uso futuro)
- **Limite:** 100 requisições/15 minutos
- **Uso:** Rotas gerais de API

**Características:**
- ✅ Usa ID do usuário quando autenticado (mais preciso)
- ✅ Fallback para IP quando não autenticado
- ✅ Desabilitado em desenvolvimento para facilitar testes
- ✅ Headers padrão `RateLimit-*` para feedback ao cliente

---

### 3. Validação de Inputs com Zod

**Arquivo:** `server/validation.ts`

Criados schemas Zod para todas as rotas críticas com middlewares reutilizáveis:

#### Schemas Implementados:

1. **nathiaChatSchema**
   - sessionId: UUID válido
   - message: 1-2000 caracteres

2. **maeValenteSearchSchema**
   - question: 3-500 caracteres

3. **saveQaSchema**
   - question, answer: strings não vazias
   - sources: array de objetos com URLs válidas

4. **createHabitSchema**
   - title: 1-50 caracteres
   - emoji: emoji válido
   - color: formato Tailwind gradient

5. **createCommunityPostSchema**
   - authorName: 1-50 caracteres
   - type: enum ["desabafo", "vitoria", "apoio", "reflexao"]
   - content: 10-1000 caracteres
   - tag: opcional, máx 30 caracteres

6. **createCommentSchema**
   - authorName: 1-50 caracteres
   - content: 1-150 caracteres

7. **createReactionSchema**
   - type: enum ["heart", "hands", "sparkles"]

8. **createReportSchema**
   - reason: opcional, máx 200 caracteres

#### Middlewares:
- `validateBody<T>()` - Valida req.body
- `validateQuery<T>()` - Valida req.query
- `validateParams<T>()` - Valida req.params

**Benefícios:**
- ✅ Mensagens de erro amigáveis em português
- ✅ Previne SQL injection, XSS, buffer overflow
- ✅ Garante tamanhos razoáveis (limita custos de API)
- ✅ Type-safe (TypeScript)

---

### 4. Aplicação nas Rotas

**Arquivo:** `server/routes.ts`, `server/auth-routes.ts`

Todas as rotas críticas foram protegidas:

| Rota | Rate Limit | Validação | Auth |
|------|-----------|-----------|------|
| POST /api/nathia/chat | aiChatLimiter | nathiaChatSchema | ✅ |
| POST /api/mae-valente/search | aiSearchLimiter | maeValenteSearchSchema | ❌ |
| POST /api/mae-valente/save | ❌ | saveQaSchema | ✅ |
| POST /api/habits | ❌ | createHabitSchema | ✅ |
| POST /api/community/posts | ❌ | createCommunityPostSchema | ✅ |
| POST /api/community/posts/:id/comments | ❌ | createCommentSchema | ✅ |
| POST /api/community/posts/:id/reactions | ❌ | createReactionSchema | ✅ |
| POST /api/community/posts/:id/reports | ❌ | createReportSchema | ✅ |
| POST /api/auth/register | authLimiter | registerSchema | ❌ |
| POST /api/auth/login | authLimiter | loginSchema | ❌ |

---

## 🧪 Como Testar

### 1. Teste de Rate Limiting

```bash
# Teste NathIA (deve bloquear após 10 requests em 1 minuto)
for i in {1..12}; do
  curl -X POST http://localhost:5000/api/nathia/chat \
    -H "Content-Type: application/json" \
    -b cookies.txt \
    -d '{"sessionId":"123e4567-e89b-12d3-a456-426614174000","message":"teste"}' \
    && echo " - Request $i"
done

# Teste MãeValente (deve bloquear após 5 requests em 1 minuto)
for i in {1..7}; do
  curl -X POST http://localhost:5000/api/mae-valente/search \
    -H "Content-Type: application/json" \
    -d '{"question":"O que é depressão pós-parto?"}' \
    && echo " - Request $i"
done

# Teste Auth (deve bloquear após 5 tentativas em 15 minutos)
for i in {1..7}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"teste@exemplo.com","password":"senha123"}' \
    && echo " - Request $i"
done
```

Resposta esperada no bloqueio:
```json
{
  "error": "Muitas mensagens enviadas. Aguarde um minuto e tente novamente."
}
```

Headers esperados:
```
RateLimit-Limit: 10
RateLimit-Remaining: 0
RateLimit-Reset: 1234567890
```

### 2. Teste de Validação

```bash
# Teste mensagem vazia (deve retornar 400)
curl -X POST http://localhost:5000/api/nathia/chat \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"sessionId":"123e4567-e89b-12d3-a456-426614174000","message":""}'

# Teste mensagem muito longa (deve retornar 400)
curl -X POST http://localhost:5000/api/nathia/chat \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d "{\"sessionId\":\"123e4567-e89b-12d3-a456-426614174000\",\"message\":\"$(printf 'a%.0s' {1..2001})\"}"

# Teste UUID inválido (deve retornar 400)
curl -X POST http://localhost:5000/api/nathia/chat \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"sessionId":"invalid-uuid","message":"teste"}'

# Teste pergunta muito curta (deve retornar 400)
curl -X POST http://localhost:5000/api/mae-valente/search \
  -H "Content-Type: application/json" \
  -d '{"question":"ab"}'
```

Resposta esperada em validação:
```json
{
  "error": "Dados inválidos",
  "details": "Mensagem não pode estar vazia"
}
```

### 3. Teste de SESSION_SECRET

Para testar em ambiente de produção simulado:

```bash
# Deve falhar na inicialização
NODE_ENV=production npm start

# Deve funcionar
NODE_ENV=production SESSION_SECRET="$(openssl rand -base64 32)" DATABASE_URL="..." npm start
```

---

## 📊 Métricas de Segurança

### Antes das Melhorias:
- ❌ APIs de IA sem proteção → Vulnerável a abuso
- ❌ Inputs sem validação → Vulnerável a injection
- ❌ Secret padrão exposto → Vulnerável a session hijacking
- ❌ Auth sem rate limiting → Vulnerável a brute force

### Depois das Melhorias:
- ✅ APIs de IA com rate limiting granular
- ✅ Todos os inputs validados com Zod
- ✅ Secret obrigatório em produção
- ✅ Auth protegida contra brute force

---

## 🔜 Próximos Passos Recomendados

Estas melhorias cobrem as prioridades **CRÍTICAS** e **URGENTES**. Para reforçar ainda mais a segurança:

### Curto Prazo:
1. **Logging Estruturado** - Implementar Pino para audit trail
2. **CORS Configurado** - Restringir origens permitidas
3. **Helmet.js** - Headers de segurança HTTP

### Médio Prazo:
4. **Redis para Rate Limit** - Sincronizar entre múltiplas instâncias
5. **Webhook Signatures** - Validar webhooks de pagamento
6. **2FA (Opcional)** - Two-factor authentication

### Longo Prazo:
7. **Penetration Testing** - Contratar auditoria de segurança
8. **WAF (Web Application Firewall)** - Cloudflare ou AWS WAF
9. **Bug Bounty Program** - Programa de recompensas

---

## 📚 Referências

- [OWASP Top 10 2021](https://owasp.org/www-project-top-ten/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Zod Documentation](https://zod.dev/)
- [express-rate-limit](https://github.com/express-rate-limit/express-rate-limit)

---

**Data de Implementação:** 2025-01-11
**Versão:** 1.0
**Status:** ✅ Completo

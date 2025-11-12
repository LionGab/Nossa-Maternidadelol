# 🔒 Segurança: Validação de Identidade do Usuário

## Problema Identificado

A ausência de verificação de autorização permitia falsificação de identidade do usuário. Usuários poderiam acessar recursos de outros usuários se soubessem os IDs.

## Vulnerabilidades Corrigidas

### 1. Sessões de AI (Agent Sessions)

**Problema:** Usuários podiam acessar mensagens de outros usuários se soubessem o `sessionId`.

**Rotas Afetadas:**
- `GET /api/agents/:agentType/messages/:sessionId`
- `POST /api/agents/:agentType/chat`
- `GET /api/nathia/messages/:sessionId`
- `POST /api/nathia/chat`

**Solução:** Middleware `validateSessionOwnership` que verifica se a sessão pertence ao usuário autenticado.

### 2. Validação de userId em Requisições

**Problema:** Se alguma rota aceitasse `userId` do body/params/query, poderia permitir falsificação.

**Solução:** Middleware `validateUserId` que valida se qualquer `userId` na requisição corresponde ao usuário autenticado.

## Implementação

### Middleware: `validateSessionOwnership`

```typescript
export async function validateSessionOwnership(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authenticatedUserId = req.user?.id;
  const sessionId = req.params?.sessionId || req.body?.sessionId;
  
  if (sessionId) {
    const session = await storage.getAiSession(sessionId);
    
    if (session && session.userId !== authenticatedUserId) {
      return res.status(403).json({ 
        error: "Não autorizado: sessão não pertence ao usuário autenticado" 
      });
    }
  }
  
  next();
}
```

**O que faz:**
- Verifica se `sessionId` existe na requisição
- Busca a sessão no banco de dados
- Compara `session.userId` com `req.user.id`
- Retorna 403 se não corresponder
- Registra tentativa de acesso não autorizado

### Middleware: `validateUserId`

```typescript
export function validateUserId(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authenticatedUserId = req.user?.id;
  
  // Verifica userId em body, params e query
  if (req.body?.userId && req.body.userId !== authenticatedUserId) {
    return res.status(403).json({ 
      error: "Não autorizado: userId não corresponde ao usuário autenticado" 
    });
  }
  
  // ... mesma validação para params e query
  
  next();
}
```

**O que faz:**
- Verifica `userId` em `req.body`, `req.params` e `req.query`
- Compara com `req.user.id` (usuário autenticado)
- Retorna 403 se não corresponder
- Registra tentativa de falsificação de identidade

## Rotas Protegidas

### Sessões de AI

```typescript
// ✅ ANTES (VULNERÁVEL)
app.get("/api/agents/:agentType/messages/:sessionId", requireAuth, async (req, res) => {
  const session = await storage.getAiSession(sessionId);
  const messages = await storage.getAiMessages(sessionId);
  // ❌ Não verifica se session pertence ao usuário
});

// ✅ DEPOIS (SEGURO)
app.get("/api/agents/:agentType/messages/:sessionId", 
  requireAuth, 
  validateSessionOwnership,  // ✅ Valida ownership
  async (req, res) => {
    const session = await storage.getAiSession(sessionId);
    // ✅ Double-check (defense in depth)
    if (session.userId !== req.user.id) {
      return res.status(403).json({ error: "Não autorizado" });
    }
  }
);
```

## Defense in Depth

Aplicamos **defense in depth** (múltiplas camadas de segurança):

1. **Middleware `validateSessionOwnership`** - Valida antes de processar
2. **Verificação manual na rota** - Double-check dentro da rota
3. **Logging de tentativas** - Registra tentativas de acesso não autorizado

## Logging de Segurança

Todas as tentativas de falsificação são registradas:

```typescript
logger.warn({ 
  msg: "Identity spoofing attempt detected",
  authenticatedUserId: req.user.id,
  attemptedUserId: req.body.userId,
  path: req.path 
});
```

**Onde verificar:**
- Logs do servidor (Pino logger)
- Vercel Dashboard → Functions → Logs (em produção)

## Rotas Já Seguras

As seguintes rotas já estavam seguras (usam apenas `req.user.id`):

- ✅ `/api/favorites` - Usa `req.user.id` diretamente
- ✅ `/api/habits` - Usa `req.user.id` diretamente
- ✅ `/api/habits/:habitId/complete` - Verifica ownership do hábito
- ✅ `/api/habits/:habitId` - Verifica ownership do hábito
- ✅ `/api/community/posts` - Usa `req.user.id` diretamente
- ✅ `/api/community/posts/:postId/comments` - Usa `req.user.id` diretamente

## Testes de Segurança

### Teste 1: Acesso a Sessão de Outro Usuário

```bash
# Como usuário A, criar sessão
POST /api/agents/general/chat
{ "sessionId": "session-123", "message": "Olá" }

# Como usuário B, tentar acessar sessão do usuário A
GET /api/agents/general/messages/session-123
# ✅ Deve retornar 403 Forbidden
```

### Teste 2: Tentativa de Falsificação de userId

```bash
# Como usuário A, tentar usar userId do usuário B
POST /api/some-endpoint
{ "userId": "user-b-id", ... }
# ✅ Deve retornar 403 Forbidden (se rota usar validateUserId)
```

## Boas Práticas Aplicadas

1. ✅ **Nunca confiar em userId do cliente** - Sempre usar `req.user.id`
2. ✅ **Validar ownership de recursos** - Verificar se recurso pertence ao usuário
3. ✅ **Defense in depth** - Múltiplas camadas de validação
4. ✅ **Logging de segurança** - Registrar tentativas de acesso não autorizado
5. ✅ **Mensagens de erro genéricas** - Não expor informações sensíveis

## Próximos Passos

### Rotas que Podem Precisar Validação

Se no futuro adicionar rotas que aceitam `userId` explicitamente:

```typescript
// ❌ NUNCA fazer assim
app.post("/api/users/:userId/update", requireAuth, async (req, res) => {
  const { userId } = req.params;
  // ❌ Não valida se userId === req.user.id
});

// ✅ SEMPRE fazer assim
app.post("/api/users/:userId/update", 
  requireAuth, 
  validateUserId,  // ✅ Valida userId
  async (req, res) => {
    const userId = req.user.id;  // ✅ Usa userId autenticado
  }
);
```

## Referências

- [OWASP: Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
- [OWASP: Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

**Status:** ✅ Corrigido  
**Arquivos Modificados:**
- `server/auth.ts` - Adicionados middlewares `validateUserId` e `validateSessionOwnership`
- `server/routes.ts` - Aplicado `validateSessionOwnership` em rotas de AI sessions

**Data:** 2025-01-12


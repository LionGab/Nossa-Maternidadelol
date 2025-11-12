# Correção de Erros 401 e 500 - Sistema de Autenticação

## Problema Identificado

### Erro 401 Unauthorized
- **Causa**: Frontend não estava enviando token JWT nas requisições protegidas
- **Sintoma**: Rotas protegidas (como `/api/nathia/chat`, `/api/habits`) retornavam 401
- **Root Cause**: Após login, o frontend recebia `session.access_token` mas não armazenava/enviava nas requisições subsequentes

### Erro 500 Internal Server Error
- **Causa**: Falta de tratamento de erros adequado nas rotas
- **Sintoma**: Erros não tratados causavam 500 em vez de respostas apropriadas
- **Root Cause**: Falta de try-catch em rotas públicas e erros não tratados no middleware de autenticação

## Solução Implementada

### 1. Sistema de Autenticação no Frontend (`client/src/lib/auth.ts`)

Criado sistema completo de gerenciamento de tokens JWT:

```typescript
// Armazenar token após login
setAuth(session, user);

// Obter token para requisições
getAuthToken();

// Obter header Authorization
getAuthHeader(); // Retorna: { Authorization: "Bearer <token>" }

// Limpar autenticação
clearAuth();
```

**Funcionalidades**:
- Armazena token JWT no `localStorage`
- Gerencia refresh token (se disponível)
- Verifica expiração do token
- Limpa tokens expirados automaticamente

### 2. Atualização do Query Client (`client/src/lib/queryClient.ts`)

Atualizado para incluir token JWT automaticamente em todas as requisições:

```typescript
// Agora inclui token automaticamente
const authHeaders = getAuthHeader();
const res = await fetch(url, { 
  headers: authHeaders,
  credentials: "include", // Também envia cookies
});
```

**Benefícios**:
- Token incluído automaticamente em todas as requisições
- Suporta tanto JWT (header) quanto cookies (session)
- Não requer mudanças em componentes existentes

### 3. Melhoria no Middleware de Autenticação (`server/auth.ts`)

Adicionado tratamento de erros robusto:

```typescript
export async function requireAuth(req, res, next) {
  try {
    // ... validação de token
    
    // Tratamento de erros de banco de dados
    try {
      dbUser = await storage.getUser(user.id);
    } catch (dbError) {
      // Retorna 500 em vez de 401 para erros de banco
      return res.status(500).json({ error: "Erro interno do servidor." });
    }
    
    // ... continuação
  } catch (error) {
    // Tratamento específico para Supabase não configurado
    if (error.message?.includes("SUPABASE_URL")) {
      return res.status(500).json({ 
        error: "Autenticação não configurada." 
      });
    }
    // ... outros erros
  }
}
```

**Melhorias**:
- Diferencia erros de autenticação (401) de erros de servidor (500)
- Trata erros de banco de dados adequadamente
- Fornece mensagens de erro mais específicas
- Não bloqueia requisições em erros não críticos (ex: atualização de last login)

### 4. Tratamento de Erros em Rotas Públicas (`server/routes.ts`)

Adicionado try-catch em todas as rotas públicas:

```typescript
// Antes
app.get("/api/daily-featured", async (req, res) => {
  const featured = await storage.getDailyFeatured(today);
  res.json(featured);
});

// Depois
app.get("/api/daily-featured", async (req, res) => {
  try {
    const featured = await storage.getDailyFeatured(today);
    res.json(featured);
  } catch (error) {
    logger.error({ err: error, msg: "Error fetching daily featured" });
    res.status(500).json({ error: "Erro ao carregar conteúdo do dia." });
  }
});
```

**Rotas Protegidas com Erro Tratado**:
- `/api/daily-featured` (pública)
- `/api/posts` (pública)
- `/api/posts/featured` (pública)
- `/api/viral-posts` (pública)
- `/api/community/posts` (pública - GET)
- `/api/community/posts/:postId/comments` (pública - GET)
- `/api/community/question` (pública)

## Como Usar

### 1. Após Login

```typescript
import { setAuth } from "@/lib/auth";

// Após login bem-sucedido
const response = await fetch("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});

const data = await response.json();

// Armazenar token e usuário
if (data.session && data.user) {
  setAuth(data.session, data.user);
}
```

### 2. Fazer Requisições Protegidas

O token é incluído automaticamente em todas as requisições:

```typescript
// Funciona automaticamente - token incluído
const response = await fetch("/api/habits", {
  credentials: "include",
});

// Ou usando apiRequest
import { apiRequest } from "@/lib/queryClient";

const response = await apiRequest("POST", "/api/nathia/chat", {
  sessionId,
  message: "Olá!",
});
```

### 3. Verificar Autenticação

```typescript
import { isAuthenticated, getAuthUser } from "@/lib/auth";

if (isAuthenticated()) {
  const user = getAuthUser();
  console.log("Usuário autenticado:", user);
} else {
  console.log("Usuário não autenticado");
}
```

### 4. Logout

```typescript
import { clearAuth } from "@/lib/auth";

// Limpar autenticação
clearAuth();

// Opcional: chamar API de logout
await fetch("/api/auth/logout", {
  method: "POST",
  credentials: "include",
});
```

## Rotas Públicas vs Protegidas

### Rotas Públicas (Não Requerem Autenticação)
- `GET /api/daily-featured`
- `GET /api/posts`
- `GET /api/posts/featured`
- `GET /api/viral-posts`
- `GET /api/community/posts`
- `GET /api/community/posts/:postId/comments`
- `GET /api/community/question`
- `POST /api/mae-valente/search`

### Rotas Protegidas (Requerem Autenticação)
- `GET /api/favorites`
- `POST /api/favorites`
- `DELETE /api/favorites/:postId`
- `GET /api/agents/:agentType/messages/:sessionId`
- `POST /api/agents/:agentType/chat`
- `GET /api/nathia/messages/:sessionId`
- `POST /api/nathia/chat`
- `GET /api/mae-valente/saved`
- `POST /api/mae-valente/save`
- `GET /api/habits`
- `POST /api/habits`
- `DELETE /api/habits/:habitId`
- `POST /api/habits/:habitId/complete`
- `DELETE /api/habits/:habitId/complete`
- `GET /api/stats`
- `GET /api/achievements`
- `GET /api/habits/week-stats`
- `GET /api/habits/history`
- `POST /api/community/posts`
- `POST /api/community/posts/:postId/comments`
- `POST /api/community/posts/:postId/reactions`
- `DELETE /api/community/posts/:postId/reactions/:type`
- `POST /api/community/posts/:postId/reports`
- `POST /api/upload/avatar`
- `POST /api/upload/content`

## Tratamento de Erros

### Erro 401 Unauthorized
**Causas Comuns**:
- Token não enviado na requisição
- Token expirado
- Token inválido
- Usuário não existe no banco de dados

**Solução**:
1. Verificar se token está sendo enviado: `getAuthToken()`
2. Verificar se token expirou: `clearAuth()` e fazer login novamente
3. Verificar se usuário existe no banco de dados

### Erro 500 Internal Server Error
**Causas Comuns**:
- Erro no banco de dados
- Supabase não configurado
- Erro não tratado em rota

**Solução**:
1. Verificar logs do servidor: `logger.error()`
2. Verificar configuração do Supabase: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
3. Verificar configuração do banco de dados: `DATABASE_URL`

## Próximos Passos

1. **Implementar Refresh Token**: Atualizar token automaticamente quando expirar
2. **Adicionar Interceptor de Erro**: Tratar 401 globalmente e redirecionar para login
3. **Adicionar Loading States**: Mostrar loading durante autenticação
4. **Adicionar Retry Logic**: Tentar novamente requisições que falharam com 401 após refresh token

## Notas Importantes

1. **Tokens JWT**: Tokens são armazenados no `localStorage` - não são seguros para dados sensíveis
2. **Cookies**: O sistema também suporta cookies do Supabase para session-based auth
3. **Segurança**: Tokens expiram automaticamente - verificação de expiração implementada
4. **Development**: Em desenvolvimento, se Supabase não estiver configurado, erros são tratados graciosamente
5. **Production**: Em produção, Supabase é obrigatório - aplicação falha se não estiver configurado

## Verificação

Para verificar se a correção está funcionando:

1. **Teste de Autenticação**:
   ```bash
   # Fazer login
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password"}'
   
   # Fazer requisição protegida com token
   curl -X GET http://localhost:5000/api/habits \
     -H "Authorization: Bearer <token>"
   ```

2. **Teste de Rotas Públicas**:
   ```bash
   # Deve funcionar sem token
   curl http://localhost:5000/api/daily-featured
   ```

3. **Teste de Erros**:
   ```bash
   # Deve retornar 401 sem token
   curl -X GET http://localhost:5000/api/habits
   
   # Deve retornar 500 em erro de servidor
   # (testar com Supabase não configurado)
   ```

## Conclusão

A solução implementada resolve os problemas de 401 e 500:

1. **401 Unauthorized**: Resolvido com sistema de autenticação no frontend que armazena e envia tokens JWT automaticamente
2. **500 Internal Server Error**: Resolvido com tratamento de erros adequado em todas as rotas e middleware de autenticação

O sistema agora:
- ✅ Armazena tokens JWT após login
- ✅ Envia tokens automaticamente em todas as requisições
- ✅ Trata erros adequadamente (401 vs 500)
- ✅ Fornece mensagens de erro claras
- ✅ Funciona com rotas públicas e protegidas
- ✅ Suporta tanto JWT (header) quanto cookies (session)


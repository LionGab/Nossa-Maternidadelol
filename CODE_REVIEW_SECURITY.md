# 🔒 Code Review: Security Audit

**Data:** 2025-11-11
**Score Geral:** 78/100 (BOM)
**Status:** ⚠️ Requer correções antes de produção

---

## 📊 Resumo Executivo

O projeto tem **base sólida de segurança** com implementações modernas, mas **CORS e headers ausentes** são críticos. Principais issues:

| Categoria | Score | Status |
|-----------|-------|--------|
| Authentication | 85/100 | ✅ BOM |
| Input Validation | 75/100 | ⚠️ PRECISA MELHORIAS |
| Rate Limiting | 80/100 | ✅ BOM |
| Data Exposure | 90/100 | ✅ EXCELENTE |
| CORS & Headers | 30/100 | 🔴 CRÍTICO |

---

## 🔴 VULNERABILIDADES CRÍTICAS

### 1. CORS Não Configurado (Severidade: ALTA)
- Express aceita requisições de qualquer origem por padrão
- **Risco:** CSRF, data theft de outros domínios
- **Correção:**
```bash
npm install cors @types/cors
```
```typescript
// server/index.ts
import cors from "cors";
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5000",
  credentials: true,
}));
```

### 2. Security Headers Ausentes (Severidade: ALTA)
- Sem X-Frame-Options (permite clickjacking)
- Sem CSP (permite XSS)
- Sem HSTS (não força HTTPS)
- **Correção:**
```bash
npm install helmet
```
```typescript
// server/index.ts
import helmet from "helmet";
app.use(helmet());
```

### 3. IDOR - Insecure Direct Object Reference (Severidade: ALTA)
**Endpoints vulneráveis:**
- `DELETE /api/habits/:habitId` (linha 360)
- `POST /api/habits/:habitId/complete` (linha 371)
- `DELETE /api/favorites/:postId` (linha 97)

**Problema:** Não verifica ownership
```typescript
// ❌ VULNERÁVEL
app.delete("/api/habits/:habitId", requireAuth, async (req, res) => {
  await storage.deleteHabit(habitId); // Qualquer usuário pode deletar
});
```

**Correção:**
```typescript
// ✅ SEGURO
app.delete("/api/habits/:habitId", requireAuth, async (req, res) => {
  const userId = req.user!.id;
  const habit = await storage.getHabit(habitId);

  if (!habit || habit.userId !== userId) {
    return res.status(404).json({ error: "Hábito não encontrado" });
  }

  await storage.deleteHabit(habitId);
  res.json({ success: true });
});
```

---

## 🟡 VULNERABILIDADES IMPORTANTES

### 4. Input Validation Incompleta
**Endpoints sem validação:**
- `POST /api/favorites` - não valida `postId`
- `DELETE /api/favorites/:postId` - não valida UUID
- `GET /api/posts` - `category` não validado como enum

**Correção:** Adicionar schemas Zod
```typescript
export const createFavoriteSchema = z.object({
  postId: z.string().uuid(),
});

export const postsQuerySchema = paginationSchema.extend({
  category: z.enum(["gravidez", "parto", "amamentacao", "saude"]).optional(),
});
```

### 5. User Enumeration
```typescript
// server/auth-routes.ts:46-51
if (existingUser) {
  return res.status(409).json({ error: "Este email já está cadastrado" });
}
```
- Atacante pode descobrir emails cadastrados
- **Correção:** Unificar mensagens de erro

### 6. Session Fixation
- `req.login()` não regenera session ID após autenticação
- **Correção:**
```typescript
req.login(user, (err) => {
  if (err) return next(err);
  req.session.regenerate((err) => {
    if (err) return next(err);
    return res.status(201).json({ ... });
  });
});
```

---

## 🟢 PONTOS FORTES

✅ **Hashing de senhas robusto** (scrypt com salt)
✅ **Rate limiting implementado** (AI, auth)
✅ **Logging estruturado** com redação de dados sensíveis
✅ **Validação Zod** em endpoints críticos
✅ **Session security** (httpOnly, secure, sameSite)

---

## 🎯 AÇÕES PRIORITÁRIAS

### P0 - CRÍTICO (Implementar AGORA)
1. **Instalar Helmet + CORS** (2h)
2. **Adicionar ownership verification** (4h)
3. **Validar todos os inputs** (6h)

### P1 - IMPORTANTE (Próxima Sprint)
4. **Aplicar rate limiters adicionais** (2h)
5. **Configurar trust proxy** (30min)
6. **Regenerar session após login** (1h)

---

**Com correções P0, score subiria para 92/100 (EXCELENTE)**

**Arquivo:** `server/index.ts`, `server/routes.ts`, `server/validation.ts`, `server/auth.ts`

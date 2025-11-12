# 🚀 Guia Rápido - Configurar MCPs

## 📋 Passo a Passo (5 minutos)

### 1. Verificar se .env existe

```powershell
# No terminal do Cursor
Test-Path .env
```

Se retornar `False`, crie o arquivo:

```powershell
# Copiar template (se .env.example existir)
Copy-Item .env.example .env

# Ou criar manualmente
New-Item .env -ItemType File
```

### 2. Adicionar API Keys no .env

Abra o arquivo `.env` e adicione:

```bash
# MCP Servers - API Keys
NEON_API_KEY=neon_api_xxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_PERSONAL_ACCESS_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxx
VERCEL_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxx  # Opcional
```

### 3. Obter API Keys

#### 🔵 Neon API Key (para Database MCP)

1. Acesse: https://console.neon.tech/app/settings/api-keys
2. Clique em **Create API Key**
3. Nome: "Nossa Maternidade MCP"
4. Copie a key (começa com `neon_api_`)
5. Cole no `.env` como `NEON_API_KEY`

#### 🐙 GitHub Personal Access Token (para GitHub MCP)

1. Acesse: https://github.com/settings/tokens
2. Clique em **Generate new token** → **Generate new token (classic)**
3. Nome: "Nossa Maternidade MCP"
4. Selecione scopes:
   - ✅ `repo` (Full repository access)
   - ✅ `workflow` (GitHub Actions access)
   - ✅ `read:org` (Organization read access)
5. Clique em **Generate token**
6. Copie o token (começa com `ghp_`)
7. Cole no `.env` como `GITHUB_PERSONAL_ACCESS_TOKEN`

#### ▲ Vercel API Token (Opcional - para Vercel MCP)

1. Acesse: https://vercel.com/account/tokens
2. Clique em **Create Token**
3. Nome: "Nossa Maternidade MCP"
4. Scope: **Full Account** (ou projeto específico)
5. Copie o token
6. Cole no `.env` como `VERCEL_API_KEY`

### 4. Verificar Configuração

Execute o script de verificação:

```powershell
.\.cursor\check-cursor.ps1
```

Ou verifique manualmente:

```powershell
# Verificar se variáveis estão no .env
Get-Content .env | Select-String "NEON_API_KEY|GITHUB_PERSONAL_ACCESS_TOKEN"
```

### 5. Reiniciar Cursor

**Importante:** MCPs só carregam quando o Cursor inicia.

1. Feche o Cursor completamente
2. Reabra o Cursor
3. Abra o projeto Nossa Maternidade
4. MCPs inicializarão automaticamente

### 6. Testar MCPs

No chat do Claude Code, teste:

**Neon MCP:**
```
List all tables in the database
```

**GitHub MCP:**
```
Show me the latest 5 commits on main branch
```

**Memory MCP:**
```
Remember that we use Drizzle ORM with Neon PostgreSQL
```

## ✅ Checklist

- [ ] Arquivo `.env` criado
- [ ] `NEON_API_KEY` adicionada no `.env`
- [ ] `GITHUB_PERSONAL_ACCESS_TOKEN` adicionada no `.env`
- [ ] `VERCEL_API_KEY` adicionada no `.env` (opcional)
- [ ] Cursor reiniciado
- [ ] MCPs testados e funcionando

## 🔒 Segurança

- ✅ **NUNCA** commite o arquivo `.env` no git
- ✅ **NUNCA** compartilhe API keys em chats
- ✅ **SEMPRE** use tokens com expiração
- ✅ **ROTACIONE** keys a cada 90 dias
- ✅ Verifique que `.env` está no `.gitignore`

## 🆘 Troubleshooting

### MCPs não inicializam?

1. Verifique se `.env` existe na raiz do projeto
2. Verifique se as variáveis estão corretas (sem espaços)
3. Reinicie o Cursor completamente
4. Verifique logs: `Ctrl+Shift+P` → "Output" → "MCP"

### Erro de autenticação?

1. Verifique formato da key (neon_api_, ghp_, etc.)
2. Verifique permissões do token (GitHub)
3. Regenerar key se necessário
4. Verificar se não expirou

### Rate limit?

- **GitHub:** 5,000 req/hour - aguarde ou use conta diferente
- **Neon:** Verificar limites do plano
- Reduzir frequência de operações MCP

## 📚 Documentação Completa

Para mais detalhes, veja: `MCP_SETUP.md`

---

**Pronto!** Seus MCPs estarão ativos após reiniciar o Cursor. 🎉


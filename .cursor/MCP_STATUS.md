# 🔌 Status dos MCPs - Nossa Maternidade

**Última atualização:** 2025-01-12

## ✅ MCPs Habilitados

| MCP Server | Status | Descrição | Variáveis Necessárias |
|------------|--------|-----------|----------------------|
| **GitHub** | ✅ Habilitado | Repository management, PR/issue automation | `GITHUB_PERSONAL_ACCESS_TOKEN` |
| **Memory** | ✅ Habilitado | Knowledge graph persistence | Nenhuma (arquivo local) |
| **Sequential Thinking** | ✅ Habilitado | Structured problem-solving | Nenhuma |
| **Vercel** | ✅ Habilitado | Deployment management | `VERCEL_API_KEY` |
| **Supabase** | ✅ Habilitado | PostgreSQL database operations | `DATABASE_URL` |

## ⚠️ MCPs Desabilitados

| MCP Server | Status | Motivo |
|------------|--------|--------|
| **Neon** | ❌ Desabilitado | Migrado para Supabase |

## 📋 Variáveis de Ambiente Necessárias

Adicione as seguintes variáveis no arquivo `.env`:

```bash
# GitHub MCP
GITHUB_PERSONAL_ACCESS_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxx

# Vercel MCP
VERCEL_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxx

# Supabase MCP (PostgreSQL)
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres

# Supabase (já configurado no projeto)
SUPABASE_URL=https://mnszbkeuerjcevjvdqme.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxxxxxxxxxxxxxxxxxxxxxxx
VITE_SUPABASE_ANON_KEY=xxxxxxxxxxxxxxxxxxxxxxxx
```

## 🚀 Como Obter as API Keys

### GitHub Personal Access Token

1. Acesse: https://github.com/settings/tokens
2. Clique em **Generate new token** → **Generate new token (classic)**
3. Nome: "Nossa Maternidade MCP"
4. Permissões:
   - ✅ `repo` (Full repository access)
   - ✅ `workflow` (GitHub Actions access)
   - ✅ `read:org` (Organization read access)
5. Copie o token (começa com `ghp_`)
6. Adicione no `.env` como `GITHUB_PERSONAL_ACCESS_TOKEN`

### Vercel API Key

1. Acesse: https://vercel.com/account/tokens
2. Clique em **Create Token**
3. Nome: "Nossa Maternidade MCP"
4. Scope: **Full Account** (ou projeto específico)
5. Copie o token
6. Adicione no `.env` como `VERCEL_API_KEY`

### Supabase DATABASE_URL

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** → **Database**
4. Copie a **Connection String** (URI)
5. Adicione no `.env` como `DATABASE_URL`

**Formato:**
```
postgresql://postgres:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

## 🧪 Testar MCPs

Após configurar as variáveis e reiniciar o Cursor, teste os MCPs:

### GitHub MCP
```
Show me the latest 5 commits on main branch
List all open pull requests
```

### Memory MCP
```
Remember that we use Supabase PostgreSQL with Drizzle ORM
What do you remember about our database setup?
```

### Sequential Thinking MCP
```
Break down the task: Migrate from in-memory storage to Supabase
```

### Vercel MCP
```
List all deployments for this project
Show me environment variables for production
```

### Supabase MCP
```
List all tables in the database
Show me the schema for the users table
Find all users created in the last 7 days
```

## 🔄 Reiniciar Cursor

**Importante:** MCPs só carregam quando o Cursor inicia.

1. Feche o Cursor completamente
2. Reabra o Cursor
3. Abra o projeto Nossa Maternidade
4. MCPs inicializarão automaticamente

## 📊 Verificar Status

Para verificar se os MCPs estão funcionando, pergunte ao Claude:

```
Are MCP servers running? Which ones are available?
```

Ou verifique os logs:

```powershell
Get-Content .cursor/logs/mcp.log -Tail 50
```

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

1. Verifique formato da key (ghp_, etc.)
2. Verifique permissões do token (GitHub)
3. Regenerar key se necessário
4. Verificar se não expirou

### Supabase MCP não conecta?

1. Verifique `DATABASE_URL` está configurada corretamente
2. Verifique se a senha está correta
3. Verifique se o IP está autorizado no Supabase
4. Teste a conexão: `psql $DATABASE_URL`

## 📚 Documentação Completa

- Guia completo: `MCP_SETUP.md`
- Guia rápido: `.cursor/SETUP_MCP.md`
- Configuração: `.cursor/mcp.json`

---

**Status:** ✅ Todos os MCPs configurados e prontos para uso!


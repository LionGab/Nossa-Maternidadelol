# MCP Setup Guide - Nossa Maternidade

**Data de instalação:** 13 de novembro de 2025
**Claude Code versão:** 2.0.37

## O que são MCPs?

Model Context Protocol (MCP) são servidores que estendem as capacidades do Claude Code, permitindo integrações com ferramentas externas, bancos de dados, APIs e outros serviços. Este documento detalha os MCPs instalados neste projeto.

---

## 🎯 MCPs Instalados

### 1. **Context7** ✅ ATIVO
- **Tipo:** HTTP Server (Remoto)
- **URL:** `https://mcp.context7.com/mcp`
- **Status:** ✓ Conectado
- **Provedor:** Upstash (Gratuito)

#### O que faz?
Fornece documentação atualizada e específica por versão de bibliotecas JavaScript/TypeScript diretamente nos prompts do Claude Code. Resolve o problema de LLMs usarem informação desatualizada sobre bibliotecas.

#### Bibliotecas úteis para este projeto:
- React 18.3.1
- Express 4.21.2
- Drizzle ORM 0.39.1
- TanStack Query 5.60.5
- Vite 5.4.20
- Radix UI (todos os componentes)
- Tailwind CSS 3.4.18

#### Como usar:
```bash
# Context7 funciona automaticamente quando você menciona bibliotecas
# Exemplo no Claude Code:
"Como usar react-query com Drizzle ORM?"
# Context7 vai buscar docs atualizadas dessas bibliotecas
```

---

### 2. **PostgreSQL MCP Server** ⚠️ REQUER CONFIGURAÇÃO
- **Tipo:** stdio (Local)
- **Comando:** `npx -y @modelcontextprotocol/server-postgres`
- **Status:** ✓ Conectado (mas usando string placeholder)

#### O que faz?
Permite que o Claude Code leia e analise seu banco de dados PostgreSQL (Supabase) diretamente. **Acesso somente leitura (read-only)** por segurança.

#### ⚠️ CONFIGURAÇÃO NECESSÁRIA

##### Passo 1: Edite o arquivo `.claude.json`
Localize a configuração do PostgreSQL MCP (linhas 389-398) e substitua `YOUR_NEON_CONNECTION_STRING` pela sua connection string do Supabase:

**Antes:**
```json
"postgres": {
  "type": "stdio",
  "command": "npx",
  "args": [
    "-y",
    "@modelcontextprotocol/server-postgres",
    "postgresql://YOUR_NEON_CONNECTION_STRING"
  ],
  "env": {}
}
```

**Depois (usando variável de ambiente):**
```json
"postgres": {
  "type": "stdio",
  "command": "npx",
  "args": [
    "-y",
    "@modelcontextprotocol/server-postgres",
    "${DATABASE_URL}"
  ],
  "env": {}
}
```

##### Passo 2: Configure a DATABASE_URL no `.env`
Já está no `.env.example` (linha 8). Obtenha sua connection string no Supabase:
1. Acesse: https://supabase.com/dashboard/project/_/settings/database
2. Copie a **Connection String** (URI format)
3. Adicione no seu `.env`:

```bash
DATABASE_URL=postgresql://postgres.mnszbkeuerjcevjvdqme:[SUA_SENHA]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

##### Passo 3: Reinicie o Claude Code
```bash
# Saia do Claude Code (Ctrl+C) e reinicie
claude
```

#### Como usar:
```bash
# No Claude Code, você pode pedir:
"Mostre as tabelas do banco de dados"
"Quantos usuários temos cadastrados?"
"Analise o schema da tabela users"
```

---

### 3. **GitHub MCP Server** ⚠️ REQUER AUTENTICAÇÃO
- **Tipo:** stdio (Local)
- **Comando:** `npx -y @modelcontextprotocol/server-github`
- **Status:** ✓ Conectado (mas requer Personal Access Token)

#### O que faz?
Integra o Claude Code com a API do GitHub, permitindo:
- Ler issues e pull requests
- Criar PRs automaticamente
- Analisar commits e histórico
- Gerenciar workflows de CI/CD
- Revisar código em PRs

#### ⚠️ CONFIGURAÇÃO NECESSÁRIA

##### Passo 1: Crie um Personal Access Token no GitHub
1. Acesse: https://github.com/settings/tokens/new
2. Nome: `Claude Code - Nossa Maternidade`
3. Scopes necessários:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Actions workflows)
   - ✅ `read:org` (Read org and team membership)
4. Clique em **Generate token**
5. **COPIE O TOKEN** (você não verá novamente!)

##### Passo 2: Adicione ao `.env`
```bash
GITHUB_PERSONAL_ACCESS_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxx
```

##### Passo 3: Configure no `.claude.json`
Edite a configuração do GitHub MCP (linhas 399-407):

**Antes:**
```json
"github": {
  "type": "stdio",
  "command": "npx",
  "args": [
    "-y",
    "@modelcontextprotocol/server-github"
  ],
  "env": {}
}
```

**Depois:**
```json
"github": {
  "type": "stdio",
  "command": "npx",
  "args": [
    "-y",
    "@modelcontextprotocol/server-github"
  ],
  "env": {
    "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PERSONAL_ACCESS_TOKEN}"
  }
}
```

##### Passo 4: Reinicie o Claude Code
```bash
# Saia do Claude Code (Ctrl+C) e reinicie
claude
```

#### Como usar:
```bash
# No Claude Code, você pode pedir:
"Liste os issues abertos do repositório"
"Crie um PR para a branch feature/nova-funcionalidade"
"Analise os commits da última semana"
"Mostre o status dos workflows do CI/CD"
```

---

## 📋 Comandos Úteis

### Listar MCPs instalados
```bash
claude mcp list
```

### Ver detalhes de um MCP específico
```bash
claude mcp get context7
claude mcp get postgres
claude mcp get github
```

### Remover um MCP
```bash
claude mcp remove <nome-do-mcp>
```

### Verificar status dos MCPs no Claude Code
```bash
# Dentro do Claude Code:
/mcp
```

---

## 🔒 Segurança e Boas Práticas

### 1. **PostgreSQL MCP**
- ✅ **Acesso somente leitura:** O MCP oficial é read-only por padrão
- ✅ **Use conexão SSL:** Supabase já usa `sslmode=require`
- ⚠️ **Não commite credenciais:** `.env` está no `.gitignore`
- 📊 **Monitore queries:** Verifique logs no Supabase Dashboard

### 2. **GitHub MCP**
- 🔑 **Proteja o token:** Nunca compartilhe ou commite o PAT
- 🔄 **Rotação regular:** Renove o token a cada 90 dias
- 🎯 **Scopes mínimos:** Use apenas os scopes necessários
- 🔐 **Revogue se comprometido:** https://github.com/settings/tokens

### 3. **Context7**
- ✅ **Servidor HTTPS:** Comunicação segura
- ✅ **Gratuito e público:** Sem credenciais necessárias
- ⚡ **Cache automático:** Reduz latência e custos

### 4. **Variáveis de Ambiente**
Adicione ao `.env` (NÃO commite este arquivo!):
```bash
# PostgreSQL (Supabase)
DATABASE_URL=postgresql://postgres.mnszbkeuerjcevjvdqme:[SUA_SENHA]@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# GitHub MCP
GITHUB_PERSONAL_ACCESS_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxx
```

---

## 🎓 Recursos e Documentação

### Documentação Oficial MCP
- **Anthropic MCP:** https://docs.anthropic.com/en/docs/claude-code/mcp
- **MCP Protocol:** https://github.com/modelcontextprotocol

### MCP Servers Oficiais
- **PostgreSQL:** https://github.com/modelcontextprotocol/servers/tree/main/src/postgres
- **GitHub:** https://github.com/modelcontextprotocol/servers/tree/main/src/github
- **Context7:** https://upstash.com/blog/context7-mcp

### Explorar Mais MCPs
- **MCP Marketplace:** https://mcpcat.io/
- **PulseMCP:** https://www.pulsemcp.com/
- **Smithery.ai:** https://smithery.ai/

---

## 🚀 Próximos Passos Recomendados

### MCPs Adicionais Úteis

#### 1. **Vercel MCP** (para deploy)
```bash
claude mcp add --transport http vercel https://mcp.vercel.com/mcp
```
Requer: `VERCEL_API_KEY` (https://vercel.com/account/tokens)

#### 2. **Sentry MCP** (para monitoramento de erros)
```bash
claude mcp add --transport http sentry https://mcp.sentry.io/mcp
```
Já usa Sentry no projeto! (`.env.example` linha 57)

#### 3. **Supabase MCP** (gerenciamento completo do Supabase)
```bash
claude mcp add --transport http supabase https://mcp.supabase.com/mcp
```
Requer: `SUPABASE_ACCESS_TOKEN`

---

## 🐛 Troubleshooting

### Erro: "MCP server not connected"
```bash
# 1. Verifique se as variáveis de ambiente estão definidas
echo $DATABASE_URL
echo $GITHUB_PERSONAL_ACCESS_TOKEN

# 2. Reinicie o Claude Code
# Ctrl+C e depois:
claude

# 3. Verifique logs
claude mcp list
```

### Erro: "OAuth authentication required"
- O GitHub MCP não usa OAuth, usa Personal Access Token
- Certifique-se de que adicionou o PAT ao `.env` e ao `.claude.json`

### Erro: "Tool names must be unique"
- Remova MCPs duplicados:
```bash
claude mcp list
claude mcp remove <nome-duplicado>
```

### PostgreSQL: "Connection refused"
- Verifique se a `DATABASE_URL` está correta
- Teste a conexão diretamente:
```bash
psql $DATABASE_URL -c "SELECT version();"
```

---

## ✅ Checklist de Configuração Completa

- [ ] Context7 instalado e funcionando (não requer config adicional)
- [ ] DATABASE_URL configurada no `.env`
- [ ] `.claude.json` atualizado com `${DATABASE_URL}` para PostgreSQL MCP
- [ ] GitHub Personal Access Token criado com scopes corretos
- [ ] GITHUB_PERSONAL_ACCESS_TOKEN no `.env`
- [ ] `.claude.json` atualizado com `${GITHUB_PERSONAL_ACCESS_TOKEN}` para GitHub MCP
- [ ] Claude Code reiniciado após configurações
- [ ] Testado comando `claude mcp list` (todos conectados ✓)
- [ ] `.env` no `.gitignore` (não commitar secrets!)

---

## 📞 Suporte

- **Issues do Projeto:** [GitHub Issues](https://github.com/modelcontextprotocol/servers/issues)
- **Documentação Claude Code:** https://docs.claude.com/en/docs/claude-code
- **Blog Anthropic MCP:** https://www.anthropic.com/news/model-context-protocol

---

**Gerado por Claude Code em 13/11/2025**
**Última atualização:** 13/11/2025

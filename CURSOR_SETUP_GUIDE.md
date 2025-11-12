# 🚀 Guia Completo de Configuração e Uso do Cursor

## ✅ Ativação Rápida (5 minutos)

### 1. Verificar Configurações Existentes

O projeto já tem tudo configurado! Verifique:

```bash
# Verificar se os arquivos existem
ls -la .cursorrules
ls -la .cursor/snippets.json
ls -la CONTEXT.md
```

### 2. Ativar no Cursor

**Passo 1:** Abra o Cursor
- Instale em: https://cursor.sh
- Ou use `Ctrl+Shift+P` → "Cursor: Install"

**Passo 2:** Abra o projeto
- `File → Open Folder` → Selecione a pasta do projeto
- Cursor detecta automaticamente `.cursorrules`

**Passo 3:** Verificar se está funcionando
- Abra qualquer arquivo `.ts` ou `.tsx`
- Digite `//` e veja se o Cursor sugere código
- Pressione `Ctrl+K` para abrir o chat do Cursor

### 3. Ativar Snippets

Os snippets já estão em `.cursor/snippets.json`. Para usar:

1. **No Cursor:**
   - Digite o prefixo do snippet (ex: `route-protected`)
   - Pressione `Tab` ou `Enter`
   - O snippet será expandido

2. **Snippets disponíveis:**
   - `route-protected` - Nova rota API protegida
   - `route-public` - Nova rota API pública
   - `component-react` - Novo componente React
   - `schema-drizzle` - Novo schema Drizzle
   - `validation-zod` - Schema de validação Zod
   - `mutation-query` - React Query mutation
   - `log-info` - Logger info
   - `log-error` - Logger error
   - `require-auth` - Rota protegida rápida
   - `paginate` - Paginação de array
   - `rate-limit` - Rota com rate limiting
   - `batch-load` - Batch loading (evitar N+1)
   - `error-response` - Resposta de erro
   - `success-response` - Resposta de sucesso

---

## 🎯 Melhores Práticas de Uso do Cursor

### 1. Comandos Essenciais (Atalhos)

| Atalho | Ação | Quando Usar |
|--------|------|-------------|
| `Ctrl+K` | Chat inline | Perguntas rápidas sobre código |
| `Ctrl+L` | Chat em nova aba | Conversas longas |
| `Ctrl+Shift+L` | Selecionar todas ocorrências | Refatorar variável |
| `Ctrl+D` | Selecionar próxima ocorrência | Refatorar múltiplas ocorrências |
| `Ctrl+/` | Comentar/descomentar | Toggle comentários |
| `Alt+↑/↓` | Mover linha | Reorganizar código |
| `Ctrl+Shift+K` | Deletar linha | Limpar código |
| `F2` | Renomear símbolo | Refatorar nomes |

### 2. Workflow Otimizado

#### A. Desenvolvimento Diário

**1. Abrir arquivo que precisa editar**
```
Ctrl+P → digite nome do arquivo
```

**2. Usar autocomplete inteligente**
- Digite código normalmente
- Cursor completa automaticamente baseado no contexto
- Aceite com `Tab` ou `Enter`

**3. Chat inline para dúvidas rápidas**
```
Ctrl+K → "Como adicionar validação aqui?"
```

**4. Refatoração rápida**
```
Ctrl+Shift+L → seleciona todas ocorrências
F2 → renomeia em todos os lugares
```

#### B. Criar Nova Feature

**1. Planejar com chat**
```
Ctrl+L → "Quero criar endpoint /api/novo-endpoint"
```

**2. Usar snippets para estrutura**
```
Digite: route-protected → Tab
```

**3. Completar com autocomplete**
- Cursor sugere código baseado em padrões existentes

**4. Validar com type check**
```
Ctrl+Shift+P → "TypeScript: Check"
```

### 3. Dicas Avançadas

#### A. Contexto Inteligente

**Cursor lê automaticamente:**
- `.cursorrules` - Regras do projeto
- Arquivos abertos no editor
- Arquivos relacionados (imports)
- Git history (últimas mudanças)

**Para dar mais contexto:**
```
Ctrl+K → "Veja server/routes.ts linha 125, quero fazer algo similar"
```

#### B. Multi-Edit

**Selecionar múltiplas ocorrências:**
1. `Ctrl+D` - Seleciona próxima ocorrência
2. `Ctrl+K Ctrl+D` - Pula próxima e seleciona depois
3. `Ctrl+Shift+L` - Seleciona todas

**Útil para:**
- Renomear variáveis
- Adicionar imports
- Corrigir typos em múltiplos lugares

#### C. Code Actions

**Pressione `Ctrl+.` em qualquer código para ver:**
- Quick fixes
- Refactor suggestions
- Import suggestions
- Type fixes

#### D. Terminal Integrado

**Abrir terminal:**
```
Ctrl+` (backtick)
```

**Comandos úteis:**
```bash
npm run dev          # Dev server
npm run check        # Type check
npm run build        # Build
npm run db:push      # Push schema
```

---

## 🔌 MCPs Recomendados (Model Context Protocol)

### O que são MCPs?

MCPs são servidores que expandem as capacidades do Cursor, conectando-o a ferramentas externas.

### Setup de MCPs

**1. Instalar MCP Server (via npm ou binário)**

**2. Configurar no Cursor:**
- `Ctrl+Shift+P` → "Preferences: Open User Settings (JSON)"
- Adicionar configuração MCP

### MCPs Essenciais para Este Projeto

#### 1. **GitHub MCP** ⭐ (Altamente Recomendado)

**O que faz:**
- Acessa issues, PRs, commits
- Cria/atualiza issues
- Comenta em PRs
- Busca código no GitHub

**Setup:**
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "seu_token_aqui"
      }
    }
  }
}
```

**Token GitHub:**
1. https://github.com/settings/tokens
2. Generate new token (classic)
3. Permissões: `repo`, `issues`, `pull_requests`
4. Copiar token

**Uso:**
```
Ctrl+K → "Criar issue sobre bug em server/routes.ts"
Ctrl+K → "Listar PRs abertos"
```

#### 2. **PostgreSQL MCP** ⭐ (Para Database)

**O que faz:**
- Executa queries SQL
- Analisa schema
- Sugere otimizações
- Valida migrations

**Setup:**
```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "sua_connection_string"
      }
    }
  }
}
```

**Uso:**
```
Ctrl+K → "Analisar performance da query em habits"
Ctrl+K → "Criar índice para melhorar /api/posts"
```

#### 3. **Filesystem MCP** (Opcional)

**O que faz:**
- Acessa arquivos fora do workspace
- Lê configurações do sistema
- Útil para scripts e automação

**Setup:**
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem"],
      "env": {
        "ALLOWED_DIRECTORIES": "/caminho/permitido"
      }
    }
  }
}
```

#### 4. **Brave Search MCP** (Para Pesquisas)

**O que faz:**
- Busca na web
- Responde perguntas técnicas
- Encontra documentação

**Setup:**
```json
{
  "mcpServers": {
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "sua_api_key"
      }
    }
  }
}
```

**API Key:** https://brave.com/search/api/

#### 5. **Slack MCP** (Para Equipe)

**O que faz:**
- Envia mensagens no Slack
- Cria canais
- Integra com notificações

**Setup:**
```json
{
  "mcpServers": {
    "slack": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-slack"],
      "env": {
        "SLACK_BOT_TOKEN": "xoxb-seu-token"
      }
    }
  }
}
```

### Configuração Completa (Exemplo)

**Arquivo:** `~/.cursor/mcp.json` ou Settings do Cursor

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_..."
      }
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "postgresql://..."
      }
    }
  }
}
```

---

## 💡 Dicas Extremamente Eficazes

### 1. Comandos de Chat Poderosos

#### A. Refatoração com Contexto
```
Ctrl+K → "Refatore esta função para usar batch loading, veja server/routes.ts:225 como exemplo"
```

#### B. Debugging Inteligente
```
Ctrl+K → "Por que este endpoint está lento? Analise server/routes.ts:225"
```

#### C. Criação com Padrões
```
Ctrl+K → "Crie endpoint /api/novo seguindo o padrão de server/routes.ts:84-89"
```

#### D. Análise de Código
```
Ctrl+L → "Analise server/storage.ts e sugira otimizações de performance"
```

### 2. Atalhos de Produtividade

#### A. Navegação Rápida
```
Ctrl+P → "routes.ts"        # Abrir arquivo
Ctrl+Shift+O → "registerRoutes"  # Ir para função
Ctrl+T → "UserStats"         # Ir para símbolo
Ctrl+Shift+F → "requireAuth" # Buscar em todos arquivos
```

#### B. Edição Rápida
```
Alt+Click → Cursor múltiplo
Ctrl+Alt+↑/↓ → Cursor em múltiplas linhas
Shift+Alt+→ → Expandir seleção
Shift+Alt+← → Reduzir seleção
```

#### C. Git Integrado
```
Ctrl+Shift+G → Abrir Git panel
Ctrl+Enter → Commit
Ctrl+Shift+P → "Git: Push"
```

### 3. Templates e Snippets Personalizados

#### Criar Seu Próprio Snippet

**1. Abrir:** `.cursor/snippets.json`

**2. Adicionar:**
```json
{
  "Meu Snippet": {
    "prefix": "meu-prefixo",
    "body": [
      "código aqui",
      "${1:placeholder}"
    ],
    "description": "Descrição do snippet"
  }
}
```

**3. Usar:**
- Digite prefixo → `Tab`

### 4. Configurações Recomendadas

#### A. Settings do Cursor

**Arquivo:** `Ctrl+,` (Settings)

**Recomendações:**
```json
{
  "editor.inlineSuggest.enabled": true,
  "editor.suggest.preview": true,
  "editor.wordBasedSuggestions": "allDocuments",
  "typescript.updateImportsOnFileMove.enabled": "always",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll": true,
    "source.organizeImports": true
  }
}
```

#### B. Extensões Úteis

**Instalar via Cursor:**
- `Ctrl+Shift+X` → Extensions

**Recomendadas:**
1. **ESLint** - Linting
2. **Prettier** - Formatação
3. **Error Lens** - Erros inline
4. **GitLens** - Git supercharged
5. **Thunder Client** - Testar APIs (alternativa ao Postman)

### 5. Workflows Avançados

#### A. Feature Branch Completo

**1. Criar branch:**
```
Ctrl+Shift+P → "Git: Create Branch"
```

**2. Desenvolver:**
- Usar Cursor normalmente
- Commits frequentes

**3. Validar:**
```
Ctrl+Shift+P → "Terminal: Run Task" → "type-check"
```

**4. Commit:**
```
Ctrl+Enter → Mensagem → Enter
```

#### B. Code Review com Cursor

**1. Abrir PR no GitHub**

**2. No Cursor:**
```
Ctrl+K → "Analise este PR: [link] e sugira melhorias"
```

**3. Aplicar sugestões:**
- Cursor pode aplicar mudanças automaticamente

#### C. Debugging com Cursor

**1. Adicionar breakpoint:**
- Click na margem esquerda

**2. Iniciar debug:**
```
F5 → Selecionar "Node.js"
```

**3. Usar chat para análise:**
```
Ctrl+K → "Por que este valor é undefined aqui?"
```

### 6. Dicas de Performance

#### A. Acelerar Autocomplete

**Desabilitar extensões pesadas:**
- Desative extensões não usadas
- Mantenha apenas essenciais

#### B. Otimizar Índices

**Reindexar projeto:**
```
Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

#### C. Limpar Cache

**Se Cursor estiver lento:**
```
Ctrl+Shift+P → "Developer: Reload Window"
```

---

## 🎓 Exemplos Práticos

### Exemplo 1: Criar Nova Rota API

**1. Abrir:** `server/routes.ts`

**2. Usar snippet:**
```
Digite: route-protected → Tab
```

**3. Completar com chat:**
```
Ctrl+K → "Complete esta rota para GET /api/novo-endpoint que retorna lista de items"
```

**4. Validar:**
```
Ctrl+Shift+P → "TypeScript: Check"
```

### Exemplo 2: Refatorar Código

**1. Selecionar código:**
```
Shift+Alt+→ → Expandir seleção
```

**2. Refatorar:**
```
Ctrl+K → "Refatore este código para usar batch loading"
```

**3. Aplicar:**
- Cursor mostra diff
- Aceite ou edite

### Exemplo 3: Debugging

**1. Adicionar log:**
```
Ctrl+K → "Adicione logger.info aqui para debug"
```

**2. Analisar:**
```
Ctrl+K → "Por que este endpoint retorna 500? Analise o erro"
```

**3. Corrigir:**
```
Ctrl+K → "Corrija este bug"
```

---

## 🔧 Troubleshooting

### Problema: Cursor não sugere código

**Solução:**
1. Verificar se `.cursorrules` existe
2. `Ctrl+Shift+P` → "TypeScript: Restart TS Server"
3. Reiniciar Cursor

### Problema: Snippets não funcionam

**Solução:**
1. Verificar `.cursor/snippets.json` existe
2. Verificar sintaxe JSON válida
3. Reiniciar Cursor

### Problema: MCPs não conectam

**Solução:**
1. Verificar configuração JSON válida
2. Verificar tokens/credenciais
3. Ver logs: `Ctrl+Shift+P` → "Output" → "MCP"

### Problema: Autocomplete lento

**Solução:**
1. Desabilitar extensões não usadas
2. `Ctrl+Shift+P` → "TypeScript: Restart TS Server"
3. Limpar cache: `Ctrl+Shift+P` → "Developer: Reload Window"

---

## 📚 Recursos Adicionais

### Documentação Oficial
- Cursor Docs: https://cursor.sh/docs
- MCP Docs: https://modelcontextprotocol.io

### Comunidade
- Cursor Discord: https://discord.gg/cursor
- GitHub: https://github.com/getcursor/cursor

### Tutoriais
- YouTube: "Cursor AI Tutorial"
- Blog: https://cursor.sh/blog

---

## ✅ Checklist de Configuração

- [ ] Cursor instalado
- [ ] Projeto aberto no Cursor
- [ ] `.cursorrules` detectado (aparece no status bar)
- [ ] Snippets funcionando (teste com `route-protected`)
- [ ] TypeScript check funcionando (`npm run check`)
- [ ] Terminal integrado funcionando (`Ctrl+` `)
- [ ] Chat funcionando (`Ctrl+K`)
- [ ] MCPs configurados (opcional)
- [ ] Extensões úteis instaladas (opcional)

---

**Última atualização:** 2025-01-11  
**Versão:** 1.0


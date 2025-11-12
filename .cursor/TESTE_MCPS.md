# 🧪 Guia de Teste dos MCPs

**Data:** 2025-01-12  
**Status:** ✅ Configuração completa - Pronto para testar

## ✅ Validação Pré-Teste

Execute o script de validação:

```powershell
.\.cursor\test-mcps.ps1
```

Este script verifica:
- ✅ Arquivo `.env` existe
- ✅ Todas as variáveis configuradas
- ✅ Configuração `mcp.json` válida
- ✅ Node.js e npm instalados
- ✅ `.env` está no `.gitignore`

## 🚀 Passo 1: Reiniciar o Cursor

**IMPORTANTE:** MCPs só carregam quando o Cursor inicia.

1. **Feche o Cursor completamente:**
   - Feche todas as janelas do Cursor
   - Verifique no Gerenciador de Tarefas se não há processos do Cursor rodando
   - Aguarde 5 segundos

2. **Reabra o Cursor:**
   - Abra o Cursor
   - Abra o projeto Nossa Maternidade
   - Aguarde o Cursor carregar completamente

3. **Verifique os logs:**
   - `Ctrl+Shift+P` → "Output" → "MCP"
   - Ou verifique: `.cursor/logs/mcp.log`

## 🧪 Passo 2: Testar os MCPs

### Teste 1: Verificar Status dos MCPs

No chat do Claude Code, pergunte:

```
Are MCP servers running? Which ones are available?
```

**Resultado esperado:**
- Claude deve listar todos os MCPs habilitados
- GitHub, Memory, Sequential Thinking, Vercel, Supabase

### Teste 2: GitHub MCP

```
Show me the latest 5 commits on main branch
```

**Resultado esperado:**
- Claude deve buscar commits reais do repositório
- Deve listar os últimos 5 commits

**Outros testes GitHub:**
```
List all open pull requests
Show me recent commits by [author]
Find all files modified in the last PR
```

### Teste 3: Supabase MCP

```
List all tables in the database
```

**Resultado esperado:**
- Claude deve conectar ao Supabase PostgreSQL
- Deve listar todas as tabelas do banco

**Outros testes Supabase:**
```
Show me the schema for the users table
Find all users created in the last 7 days
What indexes exist on the users table?
```

### Teste 4: Vercel MCP

```
List all deployments for this project
```

**Resultado esperado:**
- Claude deve buscar deployments do Vercel
- Deve listar deployments reais

**Outros testes Vercel:**
```
Show me environment variables for production
Check status of latest deployment
Show me build logs for the last deployment
```

### Teste 5: Sequential Thinking MCP

```
Break down the task: Migrate from in-memory storage to Supabase
```

**Resultado esperado:**
- Claude deve usar structured thinking
- Deve quebrar a tarefa em passos detalhados

**Outros testes Sequential Thinking:**
```
Plan the implementation of user authentication
Analyze the performance optimization needed for the habits endpoint
```

### Teste 6: Memory MCP

```
Remember that we use Supabase PostgreSQL with Drizzle ORM
```

**Resultado esperado:**
- Claude deve armazenar a informação
- Deve confirmar que foi lembrada

**Teste de recuperação:**
```
What do you remember about our database setup?
```

**Resultado esperado:**
- Claude deve recuperar a informação armazenada anteriormente
- Deve mencionar Supabase PostgreSQL e Drizzle ORM

## 📊 Checklist de Testes

### MCPs Básicos (não requerem API keys)
- [ ] Memory MCP - Armazenar informação
- [ ] Memory MCP - Recuperar informação
- [ ] Sequential Thinking MCP - Quebrar tarefa em passos

### MCPs com API Keys
- [ ] GitHub MCP - Listar commits
- [ ] GitHub MCP - Listar PRs
- [ ] Vercel MCP - Listar deployments
- [ ] Vercel MCP - Ver environment variables
- [ ] Supabase MCP - Listar tabelas
- [ ] Supabase MCP - Ver schema
- [ ] Supabase MCP - Executar query

## 🔍 Troubleshooting

### MCPs não aparecem no chat?

1. **Verifique se o Cursor foi reiniciado completamente**
   - Feche todas as janelas
   - Aguarde 5 segundos
   - Reabra o Cursor

2. **Verifique os logs:**
   ```powershell
   Get-Content .cursor/logs/mcp.log -Tail 50
   ```

3. **Verifique se as variáveis estão corretas:**
   ```powershell
   .\.cursor\check-mcp-env.ps1
   ```

4. **Verifique se Node.js está instalado:**
   ```powershell
   node --version
   npm --version
   ```

### Erro de autenticação?

1. **GitHub:**
   - Verifique se o token tem as permissões corretas
   - Verifique se o token não expirou
   - Regenerar token se necessário

2. **Vercel:**
   - Verifique se a API key está correta
   - Verifique se a API key não expirou
   - Regenerar key se necessário

3. **Supabase:**
   - Verifique se a DATABASE_URL está correta
   - Verifique se a senha está codificada (`%40` para `@`)
   - Teste a conexão: `psql $DATABASE_URL`

### MCP não responde?

1. **Verifique se o MCP está habilitado:**
   - Abra `.cursor/mcp.json`
   - Verifique se `"enabled": true`

2. **Verifique se a variável está configurada:**
   - Abra `.env`
   - Verifique se a variável existe e tem valor

3. **Verifique os logs:**
   - Procure por erros nos logs
   - Verifique se há mensagens de conexão

## 📚 Documentação

- **Validação:** `.cursor/test-mcps.ps1`
- **Status:** `.cursor/MCP_STATUS.md`
- **Configuração:** `.cursor/MCP_CONFIGURADO.md`
- **Guia completo:** `MCP_SETUP.md`

## ✅ Próximos Passos Após Testes

1. ✅ Todos os MCPs funcionando
2. ✅ Integração com GitHub funcionando
3. ✅ Integração com Vercel funcionando
4. ✅ Integração com Supabase funcionando
5. ✅ Memory MCP armazenando informações
6. ✅ Sequential Thinking MCP funcionando

## 🎉 Sucesso!

Se todos os testes passaram, os MCPs estão configurados e funcionando corretamente!

Agora você pode usar os MCPs no chat do Claude para:
- 🔍 Consultar o banco de dados
- 📊 Gerenciar deployments
- 🔄 Gerenciar repositório GitHub
- 💾 Armazenar conhecimento
- 🧠 Pensamento estruturado

---

**Última atualização:** 2025-01-12


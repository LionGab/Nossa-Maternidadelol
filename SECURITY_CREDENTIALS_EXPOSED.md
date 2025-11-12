# 🚨 ALERTA DE SEGURANÇA: Credenciais Expostas

## ⚠️ Problema Identificado

Credenciais sensíveis foram encontradas no arquivo `.cursor/MCP_CONFIGURADO.md` que foi commitado no repositório:

1. **GitHub Personal Access Token** (linha 17)
2. **Vercel API Key** (linha 21)
3. **Supabase DATABASE_URL** com senha (linha 25)

## 🔴 AÇÃO IMEDIATA NECESSÁRIA

### 1. Revogar Credenciais Expostas

#### GitHub Personal Access Token
1. Acesse: https://github.com/settings/tokens
2. Revogue o token exposto (consulte histórico do Git se necessário)
3. Gere um novo token com as mesmas permissões
4. Configure no `.env` local: `GITHUB_PERSONAL_ACCESS_TOKEN=novo_token`

#### Vercel API Key
1. Acesse: https://vercel.com/account/tokens
2. Revogue a API key exposta (consulte histórico do Git se necessário)
3. Gere uma nova API key
4. Configure no `.env` local: `VERCEL_API_KEY=nova_api_key`

#### Supabase Database Password
1. Acesse: https://supabase.com/dashboard/project/[seu-projeto]/settings/database
2. Altere a senha do banco de dados
3. Atualize o `.env` local com a nova senha (codificada: `@` → `%40`)
4. Atualize a `DATABASE_URL` no Vercel Dashboard (Environment Variables)

### 2. Remover do Histórico do Git

**⚠️ ATENÇÃO:** Se o arquivo já foi enviado para o repositório remoto, as credenciais estão expostas no histórico.

#### Opção 1: Remover arquivo do Git (se ainda não foi commitado)
```bash
git rm --cached .cursor/MCP_CONFIGURADO.md
git commit -m "Remove credentials from repository"
```

#### Opção 2: Remover do histórico (se já foi commitado)
```bash
# Usar git filter-repo (recomendado) ou BFG Repo-Cleaner
# Isso reescreve o histórico e remove as credenciais

# Instalar git-filter-repo
pip install git-filter-repo

# Remover credenciais do histórico
git filter-repo --path .cursor/MCP_CONFIGURADO.md --invert-paths

# OU usar BFG Repo-Cleaner
# java -jar bfg.jar --delete-files MCP_CONFIGURADO.md
```

#### Opção 3: Se o repositório é privado e não foi compartilhado
1. Apagar o repositório remoto
2. Criar um novo repositório
3. Fazer push do código limpo (sem credenciais)

### 3. Verificar Outros Arquivos

Verificar se há outras credenciais expostas:
```bash
# Buscar por padrões de credenciais
grep -r "ghp_" . --exclude-dir=node_modules --exclude-dir=.git
grep -r "postgresql://" . --exclude-dir=node_modules --exclude-dir=.git
grep -r "API_KEY" . --exclude-dir=node_modules --exclude-dir=.git
```

## 📋 Correções Aplicadas

1. ✅ Credenciais removidas do arquivo `.cursor/MCP_CONFIGURADO.md`
2. ✅ Arquivo atualizado com avisos de segurança
3. ✅ `.cursor/` já está no `.gitignore` (mas arquivo já commitado precisa ser removido)

## 🔒 Prevenção Futura

### 1. Regras Básicas

- ❌ **NUNCA** commitar credenciais em arquivos versionados
- ❌ **NUNCA** colocar credenciais em arquivos de documentação
- ✅ **SEMPRE** usar `.env` para credenciais (já no `.gitignore`)
- ✅ **SEMPRE** usar placeholders em documentação: `GITHUB_TOKEN=seu_token_aqui`

### 2. Pre-commit Hooks

Instalar hooks para prevenir commits com credenciais:
```bash
# Usar git-secrets ou similar
brew install git-secrets  # macOS
# ou
pip install detect-secrets

# Configurar
git secrets --install
git secrets --register-aws
git secrets --add 'ghp_[A-Za-z0-9]{36}'
git secrets --add 'postgresql://.*:.*@'
```

### 3. Verificações Automáticas

Adicionar verificação no CI/CD:
```yaml
# .github/workflows/security.yml
name: Security Scan
on: [push, pull_request]
jobs:
  secrets:
    runs-on: ubuntu-latest
    steps:
      - uses: trufflesecurity/trufflehog@main
        with:
          path: ./
```

### 4. Documentação Segura

Sempre usar placeholders em documentação:
```markdown
# ❌ ERRADO
- Token: `ghp_abc123def456`

# ✅ CORRETO
- Token: `GITHUB_TOKEN=seu_token_aqui` (configure no .env)
```

## 📚 Conceitos de Segurança

### Por que isso é perigoso?

1. **Acesso não autorizado**: Qualquer pessoa com acesso ao repositório pode usar suas credenciais
2. **Ataques automatizados**: Bots varrem repositórios públicos procurando por credenciais
3. **Compliance**: Violação de políticas de segurança e privacidade
4. **Custo**: Credenciais podem ser usadas para gerar custos em sua conta

### Mentalidade de "Assume Breach"

- Assuma que qualquer credencial commitada está comprometida
- Sempre revogue credenciais expostas imediatamente
- Use rotação de credenciais regularmente
- Implemente monitoramento de uso de credenciais

### Princípio do Menor Privilégio

- Tokens devem ter apenas as permissões necessárias
- Use diferentes credenciais para desenvolvimento e produção
- Revogue credenciais não utilizadas
- Use secrets managers (Vercel, GitHub Secrets, etc.)

## ✅ Checklist de Remediação

- [ ] Revogar GitHub Personal Access Token
- [ ] Gerar novo GitHub token
- [ ] Revogar Vercel API Key
- [ ] Gerar nova Vercel API key
- [ ] Alterar senha do banco de dados Supabase
- [ ] Atualizar `.env` local com novas credenciais
- [ ] Atualizar variáveis de ambiente no Vercel
- [ ] Remover arquivo do histórico do Git (se necessário)
- [ ] Verificar outros arquivos por credenciais expostas
- [ ] Configurar pre-commit hooks
- [ ] Configurar verificação de segurança no CI/CD
- [ ] Documentar processo de gestão de credenciais

## 🔍 Verificação Final

Após corrigir tudo, verificar:
```bash
# 1. Verificar que .env está no .gitignore
cat .gitignore | grep .env

# 2. Verificar que não há credenciais no código
grep -r "ghp_\|postgresql://.*:.*@" . --exclude-dir=node_modules --exclude-dir=.git

# 3. Verificar histórico do Git
git log --all --full-history -p | grep -i "ghp_\|postgresql://"
```

## 📞 Suporte

Se precisar de ajuda:
- GitHub: https://github.com/settings/tokens
- Vercel: https://vercel.com/account/tokens
- Supabase: https://supabase.com/dashboard

---

**Data:** 2025-01-12  
**Status:** ⚠️ Credenciais removidas, ação de remediação necessária


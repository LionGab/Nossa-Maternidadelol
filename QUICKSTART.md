# ⚡ Quickstart - Começar em 5 Minutos

## 🚀 Opção 1: Aplicação Direta (Recomendado)

**Mais rápido e fácil - usa GitHub CLI**

### 1. Instale GitHub CLI (se ainda não tem)
```powershell
# Windows (PowerShell como admin)
winget install GitHub.cli

# Ou com Scoop
scoop install gh
```

### 2. Execute o script de aplicação
```powershell
# No diretório github-automation-templates
.\apply-to-github.ps1

# Ou especifique repositórios
.\apply-to-github.ps1 -Repositories "usuario/repo1","usuario/repo2"

# Com auto-merge habilitado
.\apply-to-github.ps1 -AutoMerge

# Teste sem aplicar (dry run)
.\apply-to-github.ps1 -DryRun
```

### 3. Aguarde
O script irá:
- ✅ Listar seus repositórios
- ✅ Criar branch com workflows
- ✅ Criar PR automaticamente
- ✅ (Opcional) Habilitar auto-merge

### 4. Aprove os PRs
Vá no GitHub e aprove/merge os PRs criados

### 5. Execute Setup
Em cada repositório:
1. Actions > "Setup - Configurar Permissões Automáticas"
2. Run workflow

**Pronto! 🎉**

---

## 📋 Opção 2: Instalação Manual

### 1. Clone este repositório
```bash
git clone <este-repo>
cd github-automation-templates
```

### 2. Copie para seu projeto
```bash
# Linux/Mac
./install-automations.sh /caminho/do/seu/projeto

# Windows (PowerShell)
.\install-automations.ps1 C:\caminho\do\seu\projeto
```

### 3. Push para GitHub
```bash
cd /caminho/do/seu/projeto
git push
```

### 4. Execute Setup
No GitHub:
1. Actions > "Setup - Configurar Permissões Automáticas"
2. Run workflow

**Pronto! 🎉**

---

## 🔐 Configurar Secrets (Opcional)

**Apenas se quiser deploy automático ou notificações**

### Discord Notifications
```bash
gh secret set DISCORD_WEBHOOK_URL --body "https://discord.com/api/webhooks/..."
```

### Vercel Deploy
```bash
gh secret set VERCEL_TOKEN --body "seu-token"
gh secret set VERCEL_ORG_ID --body "seu-org-id"
gh secret set VERCEL_PROJECT_ID --body "seu-project-id"
```

### VPS Deploy
```bash
gh secret set VPS_HOST --body "192.168.1.100"
gh secret set VPS_USER --body "ubuntu"
gh secret set VPS_SSH_KEY < ~/.ssh/github_actions
gh secret set VPS_PROJECT_PATH --body "/var/www/projeto"
```

**Para mais detalhes, veja [SECRETS.md](SECRETS.md)**

---

## ✅ Checklist Rápido

- [ ] GitHub CLI instalado e autenticado
- [ ] Executei script de aplicação OU copiei workflows manualmente
- [ ] PRs criados e merged (ou workflows commitados)
- [ ] Executei workflow "Setup - Configurar Permissões Automáticas"
- [ ] (Opcional) Configurei secrets para deploy/notificações

---

## 🧪 Testar Automações

### Testar CI
```bash
git add .
git commit -m "feat: test CI"
git push
# ✅ CI roda automaticamente
```

### Testar Auto-Merge
```bash
# Criar PR
gh pr create --title "Test auto-merge" --label "auto-merge"
# ✅ Merge automático quando CI passar
```

### Testar Dependabot
```bash
# Aguarde updates diários ou force:
# No GitHub: Insights > Dependency graph > Dependabot > Check for updates
# ✅ PRs criados automaticamente com auto-merge
```

### Testar Deploy
```bash
# Push para main/master
git checkout main
git merge feature-branch
git push
# ✅ Deploy automático
```

### Testar Notificações
```bash
# Faça qualquer push
git push
# ✅ Notificação enviada (se configurado webhook)
```

---

## 🆘 Ajuda Rápida

### CI não rodou?
```bash
# Verifique se workflow está habilitado
gh workflow list
gh workflow enable "CI - Tests & Build"
```

### Auto-merge não funcionou?
```bash
# Execute setup primeiro
# Actions > "Setup - Configurar Permissões Automáticas" > Run workflow
```

### Deploy falhou?
```bash
# Verifique secrets
gh secret list

# Adicione secrets faltantes (veja SECRETS.md)
```

---

## 📚 Documentação Completa

- [README.md](README.md) - Documentação completa
- [SECRETS.md](SECRETS.md) - Configuração de secrets
- [.github/workflows/](. github/workflows/) - Workflows disponíveis

---

## 💡 Dicas

### Aplicar em múltiplos repositórios de uma vez
```powershell
# Edite repos.txt com seus repositórios
.\install-to-multiple-repos.sh

# Ou use o script PowerShell
.\apply-to-github.ps1 -Repositories "user/repo1","user/repo2" -AutoMerge
```

### Desabilitar workflow específico
```bash
# Renomeie ou delete o arquivo
rm .github/workflows/deploy.yml
```

### Customizar CI
Edite `.github/workflows/ci.yml` e ajuste os steps

### Ver logs
```bash
# No GitHub: Actions > <workflow> > <run> > Logs

# Ou via CLI
gh run list
gh run view <run-id> --log
```

---

**Começar agora leva apenas 5 minutos! 🚀**

```powershell
# Execute isso agora:
.\apply-to-github.ps1
```

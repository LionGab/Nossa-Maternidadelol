# 🔐 Guia de Configuração de Secrets

Este guia explica como configurar todos os secrets necessários para as automações.

## 📍 Onde Adicionar Secrets

### Repositório Individual
```
GitHub Repo > Settings > Secrets and variables > Actions > New repository secret
```

### Organização (aplicar a todos os repos)
```
GitHub Org > Settings > Secrets and variables > Actions > New organization secret
```

---

## 🔑 Secrets Disponíveis

### 1. Notificações Discord

#### `DISCORD_WEBHOOK_URL`
**Descrição:** URL do webhook do Discord para enviar notificações

**Como obter:**
1. Acesse seu servidor no Discord
2. Clique com direito no canal > Editar Canal
3. Integrações > Webhooks > Novo Webhook
4. Copie a URL do Webhook

**Formato:**
```
https://discord.com/api/webhooks/123456789/abcdefghijklmnopqrstuvwxyz
```

**Testar:**
```bash
curl -X POST "$DISCORD_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{"content": "Teste de webhook!"}'
```

---

### 2. Notificações Slack

#### `SLACK_WEBHOOK_URL`
**Descrição:** URL do webhook do Slack para enviar notificações

**Como obter:**
1. Acesse https://api.slack.com/messaging/webhooks
2. Clique em "Create your Slack app"
3. Ative Incoming Webhooks
4. Adicione ao workspace
5. Copie a Webhook URL

**Formato:**
```
https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX
```

**Testar:**
```bash
curl -X POST "$SLACK_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{"text": "Teste de webhook!"}'
```

---

### 3. Deploy Vercel

#### `VERCEL_TOKEN`
**Descrição:** Token de autenticação da Vercel

**Como obter:**
1. Acesse https://vercel.com/account/tokens
2. Clique em "Create Token"
3. Dê um nome (ex: "GitHub Actions")
4. Copie o token

**Formato:**
```
aBc123XyZ456...
```

#### `VERCEL_ORG_ID`
**Descrição:** ID da organização/usuário Vercel

**Como obter:**
```bash
# Instale Vercel CLI
npm i -g vercel

# No diretório do projeto
vercel link

# O ID será salvo em .vercel/project.json
cat .vercel/project.json
```

**Formato:**
```
team_xxxxxxxxxxxxxxxxxxxxx
```

#### `VERCEL_PROJECT_ID`
**Descrição:** ID do projeto Vercel

**Como obter:**
```bash
# Mesmo processo do VERCEL_ORG_ID
cat .vercel/project.json
```

**Formato:**
```
prj_xxxxxxxxxxxxxxxxxxxxx
```

---

### 4. Deploy VPS (SSH)

#### `VPS_HOST`
**Descrição:** IP ou domínio do servidor VPS

**Formato:**
```
192.168.1.100
```
ou
```
meuservidor.com
```

#### `VPS_USER`
**Descrição:** Usuário SSH do servidor

**Formato:**
```
ubuntu
```
ou
```
root
```

#### `VPS_SSH_KEY`
**Descrição:** Chave privada SSH (sem senha)

**Como obter:**
```bash
# Gerar nova chave (sem senha!)
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions -N ""

# Adicionar chave pública ao servidor
ssh-copy-id -i ~/.ssh/github_actions.pub user@servidor

# Copiar chave privada (todo o conteúdo)
cat ~/.ssh/github_actions
```

**Formato:**
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
...
-----END OPENSSH PRIVATE KEY-----
```

**IMPORTANTE:**
- ⚠️ A chave NÃO pode ter senha (passphrase)
- ⚠️ Copie todo o conteúdo incluindo BEGIN e END
- ✅ Use chave dedicada (não use sua chave pessoal)

#### `VPS_SSH_PORT` (opcional)
**Descrição:** Porta SSH (padrão: 22)

**Formato:**
```
22
```

#### `VPS_PROJECT_PATH`
**Descrição:** Caminho do projeto no servidor

**Formato:**
```
/var/www/meu-projeto
```

**Testar conexão:**
```bash
ssh -i ~/.ssh/github_actions user@servidor -p 22 "cd /var/www/meu-projeto && git status"
```

---

### 5. Deploy Docker Hub

#### `DOCKER_USERNAME`
**Descrição:** Usuário do Docker Hub

**Formato:**
```
meuusuario
```

#### `DOCKER_PASSWORD`
**Descrição:** Senha ou Access Token do Docker Hub

**Como obter Access Token:**
1. Acesse https://hub.docker.com/settings/security
2. Clique em "New Access Token"
3. Dê um nome (ex: "GitHub Actions")
4. Copie o token

**Formato:**
```
dckr_pat_xxxxxxxxxxxxxxxxxxxxx
```

**Recomendação:** Use Access Token em vez de senha

**Testar:**
```bash
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
```

---

### 6. Deploy Netlify

#### `NETLIFY_AUTH_TOKEN`
**Descrição:** Token de autenticação Netlify

**Como obter:**
1. Acesse https://app.netlify.com/user/applications#personal-access-tokens
2. Clique em "New access token"
3. Dê um nome (ex: "GitHub Actions")
4. Copie o token

**Formato:**
```
nfp_xxxxxxxxxxxxxxxxxxxxx
```

#### `NETLIFY_SITE_ID`
**Descrição:** ID do site Netlify

**Como obter:**
1. Acesse seu site no Netlify
2. Site settings > General > Site details > Site ID

**Formato:**
```
xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

**Testar:**
```bash
# Instale Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# No diretório do projeto
netlify link
```

---

### 7. Notificações por Email

#### `EMAIL_USERNAME`
**Descrição:** Email remetente (Gmail)

**Formato:**
```
seuemail@gmail.com
```

#### `EMAIL_PASSWORD`
**Descrição:** Senha de app do Gmail (NÃO use sua senha normal!)

**Como obter:**
1. Ative autenticação de 2 fatores: https://myaccount.google.com/security
2. Acesse https://myaccount.google.com/apppasswords
3. Crie uma senha de app
4. Copie a senha gerada

**Formato:**
```
abcd efgh ijkl mnop
```

**IMPORTANTE:**
- ⚠️ NÃO use sua senha normal do Gmail
- ⚠️ Requer autenticação de 2 fatores habilitada

#### `EMAIL_TO`
**Descrição:** Email destinatário

**Formato:**
```
destino@example.com
```

---

## 🚀 Como Adicionar Secrets via GitHub CLI

```bash
# Repositório individual
gh secret set DISCORD_WEBHOOK_URL --body "https://discord.com/api/webhooks/..."

# Organização (todos os repos)
gh secret set DISCORD_WEBHOOK_URL --org --body "https://discord.com/api/webhooks/..."

# Do arquivo
gh secret set VPS_SSH_KEY < ~/.ssh/github_actions

# Interativo
gh secret set VERCEL_TOKEN
```

---

## 🔐 Boas Práticas de Segurança

### ✅ Faça
- ✅ Use tokens de acesso em vez de senhas
- ✅ Use chaves SSH dedicadas (não sua chave pessoal)
- ✅ Revogue tokens não utilizados
- ✅ Use Organization Secrets para compartilhar entre repos
- ✅ Use Environment Secrets para separar produção/staging
- ✅ Rotacione secrets regularmente

### ❌ Não Faça
- ❌ NUNCA commite secrets no código
- ❌ NUNCA use secrets em logs/prints
- ❌ NUNCA compartilhe secrets publicamente
- ❌ Não use senhas pessoais (use tokens)
- ❌ Não use chaves com senha (GitHub Actions não suporta)

---

## 🧪 Testar Secrets

### Teste Local
```bash
# Simule o ambiente do GitHub Actions
export DISCORD_WEBHOOK_URL="..."
export VERCEL_TOKEN="..."

# Execute seus scripts localmente
```

### Teste no GitHub Actions
Crie um workflow de teste:

```yaml
name: Test Secrets

on: workflow_dispatch

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Test Discord
        run: |
          if [ -z "${{ secrets.DISCORD_WEBHOOK_URL }}" ]; then
            echo "❌ DISCORD_WEBHOOK_URL not set"
          else
            echo "✅ DISCORD_WEBHOOK_URL is set"
          fi

      - name: Test Vercel
        run: |
          if [ -z "${{ secrets.VERCEL_TOKEN }}" ]; then
            echo "❌ VERCEL_TOKEN not set"
          else
            echo "✅ VERCEL_TOKEN is set"
          fi
```

---

## 📋 Checklist de Secrets

Marque os secrets que você configurou:

### Notificações
- [ ] `DISCORD_WEBHOOK_URL`
- [ ] `SLACK_WEBHOOK_URL`
- [ ] `EMAIL_USERNAME`
- [ ] `EMAIL_PASSWORD`
- [ ] `EMAIL_TO`

### Deploy Vercel
- [ ] `VERCEL_TOKEN`
- [ ] `VERCEL_ORG_ID`
- [ ] `VERCEL_PROJECT_ID`

### Deploy VPS
- [ ] `VPS_HOST`
- [ ] `VPS_USER`
- [ ] `VPS_SSH_KEY`
- [ ] `VPS_PROJECT_PATH`
- [ ] `VPS_SSH_PORT` (opcional)

### Deploy Docker
- [ ] `DOCKER_USERNAME`
- [ ] `DOCKER_PASSWORD`

### Deploy Netlify
- [ ] `NETLIFY_AUTH_TOKEN`
- [ ] `NETLIFY_SITE_ID`

---

## 🆘 Troubleshooting

### Secret não funciona
1. Verifique se o nome está EXATAMENTE igual (case-sensitive)
2. Verifique se não há espaços extras
3. Teste o secret localmente primeiro
4. Veja os logs do workflow (secrets aparecem como `***`)

### SSH não conecta
1. Verifique se a chave não tem senha
2. Verifique se a chave pública está no servidor (`~/.ssh/authorized_keys`)
3. Teste a conexão manualmente: `ssh -i chave user@host`
4. Verifique permissões: `chmod 600 chave`

### Webhook não envia
1. Teste o webhook com curl
2. Verifique se a URL está completa
3. Verifique se o canal/servidor ainda existe

---

**Pronto! Agora você pode configurar todos os secrets necessários! 🔐**

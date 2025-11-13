#!/bin/bash
# Script para configurar GitHub Secrets automaticamente
# Requer GitHub CLI (gh) instalado: https://cli.github.com/

set -e

echo "🔐 Setup de GitHub Secrets - Nossa Maternidade"
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) não encontrado!"
    echo ""
    echo "📥 Instale o GitHub CLI:"
    echo "   Windows: winget install GitHub.cli"
    echo "   Mac: brew install gh"
    echo "   Linux: https://github.com/cli/cli/blob/trunk/docs/install_linux.md"
    echo ""
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "🔑 Autenticando no GitHub..."
    gh auth login
fi

echo "✅ GitHub CLI autenticado"
echo ""

# Get repository info
REPO_OWNER=$(gh repo view --json owner -q .owner.login)
REPO_NAME=$(gh repo view --json name -q .name)

echo "📦 Repositório: $REPO_OWNER/$REPO_NAME"
echo ""

# Function to set secret
set_secret() {
    local secret_name=$1
    local secret_description=$2
    local secret_value

    echo "🔑 Configurando: $secret_name"
    echo "   Descrição: $secret_description"

    # Check if .env.local exists
    if [ -f .env.local ]; then
        # Try to extract value from .env.local
        secret_value=$(grep "^$secret_name=" .env.local | cut -d '=' -f 2-)

        if [ -n "$secret_value" ] && [ "$secret_value" != "your_"* ] && [ "$secret_value" != "[YOUR_"* ]; then
            echo "   ✅ Valor encontrado em .env.local"
        else
            secret_value=""
        fi
    fi

    # If not found or placeholder, ask user
    if [ -z "$secret_value" ]; then
        echo "   Digite o valor (ou Enter para pular):"
        read -s secret_value
    fi

    if [ -n "$secret_value" ]; then
        echo "$secret_value" | gh secret set "$secret_name" --repo="$REPO_OWNER/$REPO_NAME"
        echo "   ✅ Secret configurado com sucesso!"
    else
        echo "   ⏭️  Pulado"
    fi

    echo ""
}

# Set variables (not secrets, but visible)
set_variable() {
    local var_name=$1
    local var_description=$2
    local var_value

    echo "📝 Configurando variável: $var_name"
    echo "   Descrição: $var_description"

    # Check if .env.local exists
    if [ -f .env.local ]; then
        # Try to extract value from .env.local
        var_value=$(grep "^$var_name=" .env.local | cut -d '=' -f 2-)

        if [ -n "$var_value" ] && [ "$var_value" != "your_"* ] && [ "$var_value" != "[YOUR_"* ]; then
            echo "   ✅ Valor encontrado em .env.local"
        else
            var_value=""
        fi
    fi

    # If not found or placeholder, ask user
    if [ -z "$var_value" ]; then
        echo "   Digite o valor (ou Enter para pular):"
        read var_value
    fi

    if [ -n "$var_value" ]; then
        echo "$var_value" | gh variable set "$var_name" --repo="$REPO_OWNER/$REPO_NAME"
        echo "   ✅ Variável configurada com sucesso!"
    else
        echo "   ⏭️  Pulado"
    fi

    echo ""
}

echo "================================"
echo "SECRETS OBRIGATÓRIOS"
echo "================================"
echo ""

# Database
set_secret "DATABASE_URL" "Connection string do Supabase (com pooling, porta 6543)"

# Supabase
set_secret "SUPABASE_URL" "URL do projeto Supabase"
set_secret "SUPABASE_SERVICE_ROLE_KEY" "Service role key do Supabase (SECRETA!)"

# Session
set_secret "SESSION_SECRET" "Secret para sessões (gere com: openssl rand -base64 32)"

# AI APIs
set_secret "GEMINI_API_KEY" "Chave da API do Google Gemini"
set_secret "PERPLEXITY_API_KEY" "Chave da API do Perplexity"

echo "================================"
echo "SECRETS PARA DEPLOY (Vercel)"
echo "================================"
echo ""

set_secret "VERCEL_TOKEN" "Token da API do Vercel (https://vercel.com/account/tokens)"
set_secret "VERCEL_ORG_ID" "ID da organização Vercel (Settings → General)"
set_secret "VERCEL_PROJECT_ID" "ID do projeto Vercel (Project Settings → General)"

echo "================================"
echo "SECRETS OPCIONAIS"
echo "================================"
echo ""

set_secret "OPENAI_API_KEY" "Chave da API OpenAI (opcional)"
set_secret "CLAUDE_API_KEY" "Chave da API Claude (opcional)"
set_secret "REDIS_URL" "URL do Redis Upstash (opcional, para cache)"

echo "================================"
echo "VARIÁVEIS (não secretas)"
echo "================================"
echo ""

set_variable "NEON_PROJECT_ID" "ID do projeto Neon (para database branching)"

echo "================================"
echo "✅ SETUP CONCLUÍDO!"
echo "================================"
echo ""
echo "📋 Verifique os secrets configurados em:"
echo "   https://github.com/$REPO_OWNER/$REPO_NAME/settings/secrets/actions"
echo ""
echo "🚀 Agora você pode:"
echo "   1. Fazer push para 'main' → Deploy automático"
echo "   2. Abrir PR → CI roda automaticamente + Database preview"
echo "   3. Workflows terão acesso aos secrets configurados"
echo ""

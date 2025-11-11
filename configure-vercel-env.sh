#!/bin/bash
# Script to configure Vercel environment variables
# Run: chmod +x configure-vercel-env.sh && ./configure-vercel-env.sh

echo "🔧 Configurando variáveis de ambiente no Vercel..."
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI não está instalado!"
    echo "Instale com: npm install -g vercel"
    exit 1
fi

# Read .env file
if [ ! -f .env ]; then
    echo "❌ Arquivo .env não encontrado!"
    exit 1
fi

# Extract variables from .env
SESSION_SECRET=$(grep SESSION_SECRET .env | cut -d '=' -f2)
GEMINI_API_KEY=$(grep GEMINI_API_KEY .env | cut -d '=' -f2)
PERPLEXITY_API_KEY=$(grep PERPLEXITY_API_KEY .env | cut -d '=' -f2)
DATABASE_URL=$(grep DATABASE_URL .env | cut -d '=' -f2)

echo "📝 Configurando variáveis no Vercel..."
echo ""

# Set environment variables
vercel env add SESSION_SECRET production <<< "$SESSION_SECRET"
vercel env add GEMINI_API_KEY production <<< "$GEMINI_API_KEY"
vercel env add PERPLEXITY_API_KEY production <<< "$PERPLEXITY_API_KEY"

if [ ! -z "$DATABASE_URL" ]; then
    vercel env add DATABASE_URL production <<< "$DATABASE_URL"
fi

echo ""
echo "✅ Variáveis configuradas com sucesso!"
echo ""
echo "🚀 Agora execute: vercel --prod"
echo "   para fazer o deploy em produção"

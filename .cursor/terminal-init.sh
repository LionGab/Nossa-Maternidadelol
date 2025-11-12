#!/bin/bash
# Script de Inicialização do Terminal - Bash (Linux/Mac)
# Carrega variáveis de ambiente do arquivo .env automaticamente

echo ""
echo "🔧 Carregando variáveis de ambiente..."

# Verifica se o arquivo .env existe
# O script está em .cursor/, então subimos um nível para a raiz do projeto
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../.env"
if [ ! -f "$ENV_FILE" ]; then
    echo "⚠️  Arquivo .env não encontrado em: $ENV_FILE"
    echo "   Criando .env.example como referência..."
    echo "   Copie .env.example para .env e preencha com seus valores reais."
    echo ""
    return 2>/dev/null || exit 0
fi

# Carrega variáveis do arquivo .env
# Ignora linhas vazias e comentários
export $(grep -v '^#' "$ENV_FILE" | grep -v '^$' | xargs) 2>/dev/null

# Conta variáveis carregadas
LOADED_COUNT=$(grep -v '^#' "$ENV_FILE" | grep -v '^$' | grep -c '=' || echo "0")
echo "✅ $LOADED_COUNT variáveis carregadas do .env"

# Validações em produção
if [ "$NODE_ENV" = "production" ]; then
    echo ""
    echo "🔍 Validando variáveis críticas para produção..."
    
    ERRORS=()
    
    # Valida SESSION_SECRET
    if [ -z "$SESSION_SECRET" ] || [ ${#SESSION_SECRET} -lt 32 ]; then
        ERRORS+=("SESSION_SECRET deve ter no mínimo 32 caracteres em produção")
    fi
    
    # Valida DATABASE_URL
    if [ -z "$DATABASE_URL" ]; then
        ERRORS+=("DATABASE_URL é obrigatória em produção")
    fi
    
    if [ ${#ERRORS[@]} -gt 0 ]; then
        echo ""
        echo "❌ Erros de validação:"
        for error in "${ERRORS[@]}"; do
            echo "   • $error"
        done
        echo ""
        echo "⚠️  O servidor pode falhar ao iniciar em produção."
        echo ""
    else
        echo "✅ Todas as validações passaram"
    fi
fi

# Mostra variáveis críticas carregadas (sem valores sensíveis)
echo ""
echo "📋 Variáveis carregadas:"
echo "   NODE_ENV: $NODE_ENV"
echo "   PORT: ${PORT:-5000}"
echo "   DATABASE_URL: $([ -n "$DATABASE_URL" ] && echo '✅ Configurada' || echo '❌ Não configurada')"
echo "   GEMINI_API_KEY: $([ -n "$GEMINI_API_KEY" ] && echo '✅ Configurada' || echo '❌ Não configurada')"
echo "   PERPLEXITY_API_KEY: $([ -n "$PERPLEXITY_API_KEY" ] && echo '✅ Configurada' || echo '❌ Não configurada')"
echo ""


# Script de Inicialização do Terminal - PowerShell
# Carrega variáveis de ambiente do arquivo .env automaticamente

Write-Host "`n🔧 Carregando variáveis de ambiente..." -ForegroundColor Cyan

# Verifica se o arquivo .env existe
# $PSScriptRoot aponta para .cursor/, então subimos um nível para a raiz do projeto
$envFile = Join-Path (Split-Path $PSScriptRoot -Parent) ".env"
if (-not (Test-Path $envFile)) {
    Write-Host "⚠️  Arquivo .env não encontrado em: $envFile" -ForegroundColor Yellow
    Write-Host "   Criando .env.example como referência..." -ForegroundColor Yellow
    Write-Host "   Copie .env.example para .env e preencha com seus valores reais.`n" -ForegroundColor Yellow
    return
}

# Carrega variáveis do arquivo .env
$envVars = @{}
Get-Content $envFile | ForEach-Object {
    # Ignora linhas vazias e comentários
    if ($_ -match '^\s*#|^\s*$') {
        return
    }
    
    # Parse da linha KEY=VALUE
    if ($_ -match '^\s*([^#=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        
        # Remove aspas se presentes
        $value = $value -replace '^["'']|["'']$', ''
        
        # Remove comentários inline
        if ($value -match '^([^#]+)#') {
            $value = $matches[1].Trim()
        }
        
        $envVars[$key] = $value
    }
}

# Exporta variáveis para o ambiente atual
$loadedCount = 0
foreach ($key in $envVars.Keys) {
    $value = $envVars[$key]
    
    # Define a variável no ambiente atual
    Set-Item -Path "env:$key" -Value $value
    $loadedCount++
}

Write-Host "✅ $loadedCount variáveis carregadas do .env" -ForegroundColor Green

# Validações em produção
if ($env:NODE_ENV -eq "production") {
    Write-Host "`n🔍 Validando variáveis críticas para produção..." -ForegroundColor Cyan
    
    $validationErrors = @()
    
    # Valida SESSION_SECRET
    if (-not $env:SESSION_SECRET -or $env:SESSION_SECRET.Length -lt 32) {
        $validationErrors += "SESSION_SECRET deve ter no mínimo 32 caracteres em produção"
    }
    
    # Valida DATABASE_URL
    if (-not $env:DATABASE_URL) {
        $validationErrors += "DATABASE_URL é obrigatória em produção"
    }
    
    if ($validationErrors.Count -gt 0) {
        Write-Host "`n❌ Erros de validação:" -ForegroundColor Red
        foreach ($err in $validationErrors) {
            Write-Host "   • $err" -ForegroundColor Red
        }
        Write-Host "`n⚠️  O servidor pode falhar ao iniciar em produção.`n" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Todas as validações passaram" -ForegroundColor Green
    }
}

# Mostra variáveis críticas carregadas (sem valores sensíveis)
Write-Host "`n📋 Variáveis carregadas:" -ForegroundColor Cyan
Write-Host "   NODE_ENV: $env:NODE_ENV" -ForegroundColor Gray
Write-Host "   PORT: $env:PORT" -ForegroundColor Gray
Write-Host "   DATABASE_URL: $(if ($env:DATABASE_URL) { '✅ Configurada' } else { '❌ Não configurada' })" -ForegroundColor Gray
Write-Host "   GEMINI_API_KEY: $(if ($env:GEMINI_API_KEY) { '✅ Configurada' } else { '❌ Não configurada' })" -ForegroundColor Gray
Write-Host "   PERPLEXITY_API_KEY: $(if ($env:PERPLEXITY_API_KEY) { '✅ Configurada' } else { '❌ Não configurada' })" -ForegroundColor Gray
Write-Host ""


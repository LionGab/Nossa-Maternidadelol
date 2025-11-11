# Setup Vercel Environment Variables
# PowerShell script for Windows
# Run: .\setup-vercel-env.ps1

Write-Host "🔧 Configurando variáveis de ambiente no Vercel..." -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
if (-Not (Test-Path ".env")) {
    Write-Host "❌ Arquivo .env não encontrado!" -ForegroundColor Red
    exit 1
}

# Read environment variables from .env
$envVars = @{}
Get-Content ".env" | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]+)=(.+)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        $envVars[$key] = $value
    }
}

Write-Host "📝 Variáveis encontradas no .env:" -ForegroundColor Green
$envVars.Keys | ForEach-Object { Write-Host "  - $_" }
Write-Host ""

# Set environment variables using Vercel CLI
Write-Host "🚀 Configurando no Vercel (isso pode demorar um pouco)..." -ForegroundColor Yellow
Write-Host ""

# Required variables
$requiredVars = @(
    "SESSION_SECRET",
    "GEMINI_API_KEY",
    "PERPLEXITY_API_KEY"
)

foreach ($varName in $requiredVars) {
    if ($envVars.ContainsKey($varName)) {
        $value = $envVars[$varName]
        Write-Host "  Configurando $varName..." -ForegroundColor Cyan

        # Use echo to pipe the value to vercel env add
        echo $value | npx vercel env add $varName production --force 2>$null

        if ($LASTEXITCODE -eq 0) {
            Write-Host "    ✅ $varName configurado" -ForegroundColor Green
        } else {
            Write-Host "    ⚠️  $varName falhou (pode já existir)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  ⚠️  $varName não encontrado em .env" -ForegroundColor Yellow
    }
}

# Optional DATABASE_URL
if ($envVars.ContainsKey("DATABASE_URL") -and $envVars["DATABASE_URL"] -ne "") {
    Write-Host "  Configurando DATABASE_URL..." -ForegroundColor Cyan
    $value = $envVars["DATABASE_URL"]
    echo $value | npx vercel env add DATABASE_URL production --force 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "    ✅ DATABASE_URL configurado" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "✨ Configuração concluída!" -ForegroundColor Green
Write-Host ""
Write-Host "🔄 Próximos passos:" -ForegroundColor Cyan
Write-Host "  1. Acesse: https://vercel.com/dashboard" -ForegroundColor White
Write-Host "  2. Vá em Settings → Environment Variables" -ForegroundColor White
Write-Host "  3. Verifique se as variáveis foram configuradas" -ForegroundColor White
Write-Host "  4. Faça Redeploy se necessário" -ForegroundColor White
Write-Host ""

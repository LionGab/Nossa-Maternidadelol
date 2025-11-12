# Script para verificar variáveis de ambiente configuradas

$envFile = ".env"

Write-Host "`n🔍 Verificando variáveis de ambiente no .env...`n" -ForegroundColor Cyan

if (-not (Test-Path $envFile)) {
    Write-Host "❌ Arquivo .env não encontrado!" -ForegroundColor Red
    exit 1
}

$envContent = Get-Content $envFile -Encoding UTF8 -ErrorAction SilentlyContinue

# Variáveis necessárias para MCPs
$requiredVars = @(
    @{Name="GITHUB_PERSONAL_ACCESS_TOKEN"; Description="GitHub MCP"; Required=$true},
    @{Name="VERCEL_API_KEY"; Description="Vercel MCP"; Required=$true},
    @{Name="DATABASE_URL"; Description="Supabase MCP"; Required=$true}
)

Write-Host "📋 Status das variáveis:`n" -ForegroundColor Cyan

$allConfigured = $true

foreach ($var in $requiredVars) {
    $found = $false
    $value = ""
    
    foreach ($line in $envContent) {
        if ($line -match "^${var.Name}=(.*)$") {
            $found = $true
            $value = $Matches[1]
            break
        }
    }
    
    if ($found) {
        # Mascara valores sensíveis para exibição
        if ($var.Name -eq "DATABASE_URL") {
            # Mostra apenas parte da URL (mascara senha)
            if ($value -match "postgresql://postgres\.mnszbkeuerjcevjvdqme:([^@]+)@") {
                $passwordPart = $Matches[1]
                $maskedValue = $value -replace $passwordPart, "***"
                Write-Host "   ✅ $($var.Name)" -ForegroundColor Green
                Write-Host "      Descrição: $($var.Description)" -ForegroundColor Gray
                Write-Host "      Valor: $maskedValue" -ForegroundColor Gray
                
                # Verifica se a senha está codificada
                if ($passwordPart -match "%40") {
                    Write-Host "      Status: Senha codificada corretamente" -ForegroundColor Green
                } else {
                    Write-Host "      Status: Senha não codificada (pode ter problemas com caracteres especiais)" -ForegroundColor Yellow
                }
            } else {
                Write-Host "   ✅ $($var.Name)" -ForegroundColor Green
                Write-Host "      Descrição: $($var.Description)" -ForegroundColor Gray
                Write-Host "      Valor: $($value.Substring(0, [Math]::Min(50, $value.Length)))..." -ForegroundColor Gray
            }
        } else {
            # Para outras variáveis, mostra apenas os primeiros/last caracteres
            $maskedValue = if ($value.Length -gt 10) {
                $value.Substring(0, 4) + "..." + $value.Substring($value.Length - 4)
            } else {
                "***"
            }
            Write-Host "   ✅ $($var.Name)" -ForegroundColor Green
            Write-Host "      Descrição: $($var.Description)" -ForegroundColor Gray
            Write-Host "      Valor: $maskedValue" -ForegroundColor Gray
        }
    } else {
        Write-Host "   ❌ $($var.Name)" -ForegroundColor Red
        Write-Host "      Descrição: $($var.Description)" -ForegroundColor Gray
        Write-Host "      Status: Não configurada" -ForegroundColor Red
        if ($var.Required) {
            $allConfigured = $false
        }
    }
    Write-Host ""
}

# Resumo
Write-Host "📊 Resumo:" -ForegroundColor Cyan
$configuredCount = ($requiredVars | Where-Object { $found }).Count
Write-Host "   • Variáveis configuradas: $configuredCount / $($requiredVars.Count)" -ForegroundColor $(if ($allConfigured) { "Green" } else { "Yellow" })

if ($allConfigured) {
    Write-Host "`n✅ Todas as variáveis necessárias estão configuradas!`n" -ForegroundColor Green
    Write-Host "💡 Próximos passos:" -ForegroundColor Cyan
    Write-Host "   1. Reinicie o Cursor completamente" -ForegroundColor Gray
    Write-Host "   2. Os MCPs serão carregados automaticamente" -ForegroundColor Gray
    Write-Host "   3. Teste os MCPs no chat do Claude`n" -ForegroundColor Gray
} else {
    Write-Host "`n⚠️  Algumas variáveis estão faltando. Configure-as no .env`n" -ForegroundColor Yellow
}


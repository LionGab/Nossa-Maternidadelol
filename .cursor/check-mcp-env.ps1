# Script para verificar variáveis de MCP no .env

$envFile = ".env"

Write-Host "`n🔍 Verificando variáveis de MCP no .env...`n" -ForegroundColor Cyan

if (-not (Test-Path $envFile)) {
    Write-Host "❌ Arquivo .env não encontrado!" -ForegroundColor Red
    exit 1
}

$content = Get-Content $envFile -Raw

# Verifica cada variável
$vars = @(
    @{Name="GITHUB_PERSONAL_ACCESS_TOKEN"; Description="GitHub MCP"},
    @{Name="VERCEL_API_KEY"; Description="Vercel MCP"},
    @{Name="DATABASE_URL"; Description="Supabase MCP"}
)

$allConfigured = $true

foreach ($var in $vars) {
    if ($content -match "${var.Name}=(.+)") {
        $value = $Matches[1].Trim()
        
        # Remove comentários inline
        if ($value -match "^([^#]+)") {
            $value = $Matches[1].Trim()
        }
        
        if ($value -and $value -ne "") {
            Write-Host "   ✅ $($var.Name)" -ForegroundColor Green
            Write-Host "      Descrição: $($var.Description)" -ForegroundColor Gray
            
            # Mascara valores
            if ($var.Name -eq "DATABASE_URL") {
                if ($value -match "postgresql://postgres\.mnszbkeuerjcevjvdqme:([^@]+)@") {
                    $masked = $value -replace $Matches[1], "***"
                    Write-Host "      Valor: $masked" -ForegroundColor Gray
                    
                    # Verifica encoding
                    if ($value -match "%40") {
                        Write-Host "      Status: Senha codificada corretamente ✅" -ForegroundColor Green
                    } else {
                        Write-Host "      Status: Verifique se a senha está codificada" -ForegroundColor Yellow
                    }
                } else {
                    Write-Host "      Valor: $($value.Substring(0, [Math]::Min(60, $value.Length)))..." -ForegroundColor Gray
                }
            } else {
                $masked = if ($value.Length -gt 8) {
                    $value.Substring(0, 4) + "..." + $value.Substring($value.Length - 4)
                } else {
                    "***"
                }
                Write-Host "      Valor: $masked" -ForegroundColor Gray
            }
        } else {
            Write-Host "   ⚠️  $($var.Name) está vazia" -ForegroundColor Yellow
            $allConfigured = $false
        }
    } else {
        Write-Host "   ❌ $($var.Name) não encontrada" -ForegroundColor Red
        $allConfigured = $false
    }
    Write-Host ""
}

Write-Host "📊 Resumo:" -ForegroundColor Cyan
if ($allConfigured) {
    Write-Host "   ✅ Todas as variáveis estão configuradas!`n" -ForegroundColor Green
    Write-Host "💡 Próximos passos:" -ForegroundColor Cyan
    Write-Host "   1. Reinicie o Cursor completamente" -ForegroundColor Gray
    Write-Host "   2. Os MCPs serão carregados automaticamente" -ForegroundColor Gray
    Write-Host "   3. Teste os MCPs no chat do Claude`n" -ForegroundColor Gray
} else {
    Write-Host "   ⚠️  Algumas variáveis estão faltando ou vazias`n" -ForegroundColor Yellow
}


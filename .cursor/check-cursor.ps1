# Script de Verificação do Cursor
# Verifica se todas as configurações do Cursor estão ativas

Write-Host "`n🔍 Verificando configurações do Cursor...`n" -ForegroundColor Cyan

# Obter diretório raiz do projeto
$projectRoot = Get-Location

$errors = @()
$warnings = @()
$success = @()

# 1. Verificar .cursorrules
$cursorrulesPath = Join-Path $projectRoot ".cursorrules"
if (Test-Path $cursorrulesPath) {
    $success += "✅ .cursorrules encontrado"
} else {
    $errors += "❌ .cursorrules não encontrado"
}

# 2. Verificar .cursor/settings.json
$settingsPath = Join-Path $projectRoot ".cursor/settings.json"
if (Test-Path $settingsPath) {
    $success += "✅ .cursor/settings.json encontrado"
} else {
    $errors += "❌ .cursor/settings.json não encontrado"
}

# 3. Verificar .cursor/snippets.json
$snippetsPath = Join-Path $projectRoot ".cursor/snippets.json"
if (Test-Path $snippetsPath) {
    $success += "✅ .cursor/snippets.json encontrado"
} else {
    $errors += "❌ .cursor/snippets.json não encontrado"
}

# 4. Verificar .cursor/mcp.json
$mcpPath = Join-Path $projectRoot ".cursor/mcp.json"
if (Test-Path $mcpPath) {
    $success += "✅ .cursor/mcp.json encontrado"
} else {
    $errors += "❌ .cursor/mcp.json não encontrado"
}

# 5. Verificar .env (para MCPs)
$envPath = Join-Path $projectRoot ".env"
if (Test-Path $envPath) {
    $success += "✅ .env encontrado"
    # Verificar variáveis necessárias para MCPs
    $envContent = Get-Content $envPath -ErrorAction SilentlyContinue
    if ($envContent) {
        if ($envContent -match "NEON_API_KEY=") {
            $success += "   • NEON_API_KEY configurada"
        } else {
            $warnings += "⚠️  NEON_API_KEY não encontrada no .env (MCP Neon pode não funcionar)"
        }
        if ($envContent -match "GITHUB_PERSONAL_ACCESS_TOKEN=") {
            $success += "   • GITHUB_PERSONAL_ACCESS_TOKEN configurada"
        } else {
            $warnings += "⚠️  GITHUB_PERSONAL_ACCESS_TOKEN não encontrada no .env (MCP GitHub pode não funcionar)"
        }
    }
} else {
    $warnings += "⚠️  .env não encontrado (copie .env.example para .env)"
}

# 6. Verificar TypeScript
$tsconfigPath = Join-Path $projectRoot "tsconfig.json"
if (Test-Path $tsconfigPath) {
    $success += "✅ tsconfig.json encontrado"
} else {
    $errors += "❌ tsconfig.json não encontrado"
}

# 7. Verificar package.json
$packagePath = Join-Path $projectRoot "package.json"
if (Test-Path $packagePath) {
    $success += "✅ package.json encontrado"
} else {
    $errors += "❌ package.json não encontrado"
}

# Mostrar resultados
Write-Host "`n📊 Resultados:`n" -ForegroundColor Cyan

if ($success.Count -gt 0) {
    Write-Host "✅ Sucessos:" -ForegroundColor Green
    foreach ($msg in $success) {
        Write-Host "   $msg" -ForegroundColor Gray
    }
    Write-Host ""
}

if ($warnings.Count -gt 0) {
    Write-Host "⚠️  Avisos:" -ForegroundColor Yellow
    foreach ($msg in $warnings) {
        Write-Host "   $msg" -ForegroundColor Yellow
    }
    Write-Host ""
}

if ($errors.Count -gt 0) {
    Write-Host "❌ Erros:" -ForegroundColor Red
    foreach ($msg in $errors) {
        Write-Host "   $msg" -ForegroundColor Red
    }
    Write-Host ""
}

# Resumo
Write-Host "`n📋 Resumo:" -ForegroundColor Cyan
Write-Host "   • Configurações: $($success.Count) ✅" -ForegroundColor Green
Write-Host "   • Avisos: $($warnings.Count) ⚠️" -ForegroundColor $(if ($warnings.Count -gt 0) { "Yellow" } else { "Gray" })
Write-Host "   • Erros: $($errors.Count) ❌" -ForegroundColor $(if ($errors.Count -gt 0) { "Red" } else { "Gray" })

if ($errors.Count -eq 0) {
    Write-Host "`n✅ Cursor está configurado e pronto para uso!`n" -ForegroundColor Green
    Write-Host "💡 Dicas:" -ForegroundColor Cyan
    Write-Host "   • Pressione Ctrl+K para chat inline" -ForegroundColor Gray
    Write-Host "   • Digite 'route-protected' e Tab para usar snippets" -ForegroundColor Gray
    Write-Host "   • Abra qualquer arquivo .ts/.tsx para autocomplete" -ForegroundColor Gray
    Write-Host "   • Veja CURSOR_QUICK_REFERENCE.md para mais dicas`n" -ForegroundColor Gray
} else {
    Write-Host "`n❌ Há erros que precisam ser corrigidos.`n" -ForegroundColor Red
}

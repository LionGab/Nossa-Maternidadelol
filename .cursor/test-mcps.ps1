# Script de Teste e Validação dos MCPs
# Verifica se todos os MCPs estão configurados corretamente

Write-Host "`n🧪 Teste e Validação dos MCPs - Nossa Maternidade`n" -ForegroundColor Cyan

$errorList = @()
$warnings = @()
$success = @()

# 1. Verificar arquivo .env
Write-Host "1️⃣ Verificando arquivo .env..." -ForegroundColor Yellow
if (Test-Path ".env") {
    $success += "✅ Arquivo .env existe"
    Write-Host "   ✅ Arquivo .env existe" -ForegroundColor Green
} else {
    $errorList += "❌ Arquivo .env não encontrado"
    Write-Host "   ❌ Arquivo .env não encontrado" -ForegroundColor Red
}

# 2. Verificar variáveis de ambiente
Write-Host "`n2️⃣ Verificando variáveis de ambiente..." -ForegroundColor Yellow
$envContent = if (Test-Path ".env") { Get-Content ".env" -Raw } else { "" }

$requiredVars = @(
    @{Name="GITHUB_PERSONAL_ACCESS_TOKEN"; MCP="GitHub"; Pattern="^ghp_"},
    @{Name="VERCEL_API_KEY"; MCP="Vercel"; Pattern="^.{20,}"},
    @{Name="DATABASE_URL"; MCP="Supabase"; Pattern="^postgresql://"}
)

foreach ($var in $requiredVars) {
    # Procura por linha que começa com o nome da variável
    $varLine = $envContent -split "`n" | Where-Object { $_ -match "^${var.Name}=" }
    
    if ($varLine) {
        # Extrai o valor
        if ($varLine -match "${var.Name}=(.+)") {
            $value = $Matches[1].Trim()
            # Remove comentários inline
            $value = $value -replace "#.*$", "" -replace "^\s+|\s+$", ""
            
            if ($value -and $value -ne "" -and $value -notmatch "\[YOUR_PASSWORD\]") {
                # Verifica formato
                if ($var.Pattern -and $value -match $var.Pattern) {
                    $success += "✅ ${var.Name} configurada corretamente"
                    Write-Host "   ✅ ${var.Name} - ${var.MCP} MCP" -ForegroundColor Green
                
                    # Verificações específicas
                    if ($var.Name -eq "DATABASE_URL") {
                        if ($value -match "%40") {
                            Write-Host "      • Senha codificada corretamente (contém %40)" -ForegroundColor Gray
                        } else {
                            $warnings += "⚠️  DATABASE_URL pode ter caracteres especiais não codificados"
                            Write-Host "      • Verifique se a senha está codificada" -ForegroundColor Yellow
                        }
                        
                        if ($value -match "/postgres$") {
                            Write-Host "      • Database name correto (/postgres)" -ForegroundColor Gray
                        } else {
                            $warnings += "⚠️  DATABASE_URL pode ter database name incorreto"
                            Write-Host "      • Verifique se termina com /postgres" -ForegroundColor Yellow
                        }
                    }
                } else {
                    $errorList += "❌ ${var.Name} tem formato inválido (esperado: $($var.Pattern))"
                    Write-Host "   ❌ ${var.Name} - Formato inválido" -ForegroundColor Red
                    Write-Host "      Valor encontrado: $($value.Substring(0, [Math]::Min(50, $value.Length)))..." -ForegroundColor Gray
                }
            } else {
                $errorList += "❌ ${var.Name} está vazia ou contém placeholder"
                Write-Host "   ❌ ${var.Name} - Valor vazio ou placeholder" -ForegroundColor Red
            }
        } else {
            $errorList += "❌ ${var.Name} não encontrada (linha vazia)"
            Write-Host "   ❌ ${var.Name} - Linha vazia" -ForegroundColor Red
        }
    } else {
        $errorList += "❌ ${var.Name} não encontrada no .env"
        Write-Host "   ❌ ${var.Name} - Não encontrada" -ForegroundColor Red
    }
}

# 3. Verificar configuração mcp.json
Write-Host "`n3️⃣ Verificando configuração mcp.json..." -ForegroundColor Yellow
if (Test-Path ".cursor/mcp.json") {
    try {
        $mcpConfig = Get-Content ".cursor/mcp.json" -Raw | ConvertFrom-Json
        $enabledMcps = $mcpConfig.mcpServers.PSObject.Properties | Where-Object { $_.Value.enabled -eq $true }
        $enabledCount = ($enabledMcps | Measure-Object).Count
        
        $success += "✅ mcp.json configurado ($enabledCount MCPs habilitados)"
        Write-Host "   ✅ mcp.json configurado" -ForegroundColor Green
        Write-Host "   • MCPs habilitados: $enabledCount" -ForegroundColor Gray
        
        foreach ($mcp in $enabledMcps) {
            Write-Host "      • $($mcp.Name)" -ForegroundColor Gray
        }
    } catch {
        $errorList += "❌ Erro ao ler mcp.json: $_"
        Write-Host "   ❌ Erro ao ler mcp.json" -ForegroundColor Red
    }
} else {
    $errorList += "❌ mcp.json não encontrado"
    Write-Host "   ❌ mcp.json não encontrado" -ForegroundColor Red
}

# 4. Verificar diretório de logs
Write-Host "`n4️⃣ Verificando diretório de logs..." -ForegroundColor Yellow
if (Test-Path ".cursor/logs") {
    $success += "✅ Diretório de logs existe"
    Write-Host "   ✅ Diretório de logs existe" -ForegroundColor Green
    
    if (Test-Path ".cursor/logs/mcp.log") {
        $logSize = (Get-Item ".cursor/logs/mcp.log").Length
        Write-Host "   • Arquivo de log existe ($logSize bytes)" -ForegroundColor Gray
    } else {
        Write-Host "   • Arquivo de log será criado quando os MCPs iniciarem" -ForegroundColor Gray
    }
} else {
    $warnings += "⚠️  Diretório de logs não existe (será criado automaticamente)"
    Write-Host "   ⚠️  Diretório de logs não existe" -ForegroundColor Yellow
}

# 5. Verificar Node.js e npm
Write-Host "`n5️⃣ Verificando Node.js e npm..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        $success += "✅ Node.js instalado ($nodeVersion)"
        Write-Host "   ✅ Node.js instalado: $nodeVersion" -ForegroundColor Green
        
        # Verifica versão (deve ser >= 18)
        if ($nodeVersion -match "v(\d+)") {
            $majorVersion = [int]$Matches[1]
            if ($majorVersion -ge 18) {
                Write-Host "   • Versão compatível (>= 18)" -ForegroundColor Gray
            } else {
                $errorList += "❌ Node.js versão muito antiga (requer >= 18)"
                Write-Host "   ❌ Versão muito antiga (requer >= 18)" -ForegroundColor Red
            }
        }
    } else {
        $errorList += "❌ Node.js não encontrado"
        Write-Host "   ❌ Node.js não encontrado" -ForegroundColor Red
    }
    
    $npmVersion = npm --version 2>$null
    if ($npmVersion) {
        $success += "✅ npm instalado ($npmVersion)"
        Write-Host "   ✅ npm instalado: $npmVersion" -ForegroundColor Green
    } else {
        $errorList += "❌ npm não encontrado"
        Write-Host "   ❌ npm não encontrado" -ForegroundColor Red
    }
} catch {
    $errorList += "❌ Erro ao verificar Node.js/npm: $_"
    Write-Host "   ❌ Erro ao verificar Node.js/npm" -ForegroundColor Red
}

# 6. Verificar .gitignore
Write-Host "`n6️⃣ Verificando .gitignore..." -ForegroundColor Yellow
if (Test-Path ".gitignore") {
    $gitignoreContent = Get-Content ".gitignore" -Raw
    if ($gitignoreContent -match "\.env") {
        $success += "✅ .env está no .gitignore"
        Write-Host "   ✅ .env está no .gitignore" -ForegroundColor Green
    } else {
        $errorList += "❌ .env NÃO está no .gitignore (RISCO DE SEGURANÇA)"
        Write-Host "   ❌ .env NÃO está no .gitignore" -ForegroundColor Red
        Write-Host "      ⚠️  RISCO DE SEGURANÇA - Adicione .env ao .gitignore" -ForegroundColor Red
    }
} else {
    $warnings += "⚠️  .gitignore não encontrado"
    Write-Host "   ⚠️  .gitignore não encontrado" -ForegroundColor Yellow
}

# Resumo
Write-Host "`n📊 Resumo da Validação:`n" -ForegroundColor Cyan
Write-Host "   ✅ Sucessos: $($success.Count)" -ForegroundColor Green
Write-Host "   ⚠️  Avisos: $($warnings.Count)" -ForegroundColor $(if ($warnings.Count -gt 0) { "Yellow" } else { "Gray" })
Write-Host "   ❌ Erros: $($errorList.Count)" -ForegroundColor $(if ($errorList.Count -gt 0) { "Red" } else { "Gray" })

if ($errorList.Count -eq 0) {
    Write-Host "`n✅ TODAS AS VALIDAÇÕES PASSARAM!`n" -ForegroundColor Green
    Write-Host "💡 Próximos passos:" -ForegroundColor Cyan
    Write-Host "   1. Reinicie o Cursor completamente (feche todas as janelas)" -ForegroundColor Gray
    Write-Host "   2. Reabra o Cursor e abra este projeto" -ForegroundColor Gray
    Write-Host "   3. Os MCPs serão carregados automaticamente" -ForegroundColor Gray
    Write-Host "   4. Teste os MCPs no chat do Claude`n" -ForegroundColor Gray
    
    Write-Host "🧪 Comandos de teste:" -ForegroundColor Cyan
    Write-Host "   • 'Are MCP servers running? Which ones are available?'" -ForegroundColor Gray
    Write-Host "   • 'List all tables in the database' (Supabase)" -ForegroundColor Gray
    Write-Host "   • 'Show me the latest 5 commits on main branch' (GitHub)" -ForegroundColor Gray
    Write-Host "   • 'List all deployments for this project' (Vercel)`n" -ForegroundColor Gray
} else {
    Write-Host "`n❌ HÁ ERROS QUE PRECISAM SER CORRIGIDOS:`n" -ForegroundColor Red
    foreach ($err in $errorList) {
        Write-Host "   $err" -ForegroundColor Red
    }
    Write-Host ""
}

if ($warnings.Count -gt 0) {
    Write-Host "⚠️  Avisos:" -ForegroundColor Yellow
    foreach ($warning in $warnings) {
        Write-Host "   $warning" -ForegroundColor Yellow
    }
    Write-Host ""
}


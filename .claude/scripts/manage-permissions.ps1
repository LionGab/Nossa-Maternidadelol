# Script para gerenciar permissões do Claude Code
param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("allow-all", "deny-all", "review", "reset")]
    [string]$Action
)

$settingsPath = ".claude/settings.local.json"

if (-not (Test-Path $settingsPath)) {
    Write-Host "❌ Arquivo de configuração não encontrado: $settingsPath" -ForegroundColor Red
    exit 1
}

$settings = Get-Content $settingsPath | ConvertFrom-Json

switch ($Action) {
    "allow-all" {
        Write-Host "✅ Permitindo todas as permissões comuns..." -ForegroundColor Green
        $settings.permissions.allow = @(
            "Bash(*)",
            "WebFetch(*)",
            "WebSearch",
            "FileRead(*)",
            "FileWrite(*)",
            "Terminal(*)"
        )
        $settings.permissions.deny = @()
        $settings.permissions.ask = @()
    }
    "deny-all" {
        Write-Host "❌ Negando todas as permissões..." -ForegroundColor Yellow
        $settings.permissions.allow = @()
        $settings.permissions.deny = @("Bash(*)", "WebFetch(*)", "FileWrite(*)")
        $settings.permissions.ask = @()
    }
    "review" {
        Write-Host "📋 Revisando permissões atuais..." -ForegroundColor Cyan
        Write-Host "`nPermitidas (Allow):" -ForegroundColor Green
        $settings.permissions.allow | ForEach-Object { Write-Host "  ✓ $_" }
        Write-Host "`nNegadas (Deny):" -ForegroundColor Red
        $settings.permissions.deny | ForEach-Object { Write-Host "  ✗ $_" }
        Write-Host "`nPerguntar (Ask):" -ForegroundColor Yellow
        $settings.permissions.ask | ForEach-Object { Write-Host "  ? $_" }
        exit 0
    }
    "reset" {
        Write-Host "🔄 Resetando para configuração padrão..." -ForegroundColor Yellow
        $settings.permissions.allow = @(
            "Bash(cat:*)",
            "Bash(dir:*)",
            "WebSearch"
        )
        $settings.permissions.deny = @()
        $settings.permissions.ask = @()
    }
}

# Salvar configuração
$settings | ConvertTo-Json -Depth 10 | Set-Content $settingsPath
Write-Host "✅ Configuração salva em $settingsPath" -ForegroundColor Green

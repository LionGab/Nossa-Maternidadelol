# Script para corrigir DATABASE_URL com senha codificada

$envFile = ".env"
$password = "Primelion123@"

# Codifica a senha (o @ vira %40)
$encodedPassword = [System.Uri]::EscapeDataString($password)
Write-Host "Senha original: $password" -ForegroundColor Cyan
Write-Host "Senha codificada: $encodedPassword" -ForegroundColor Green

# Monta a URL completa
$databaseUrl = "postgresql://postgres.mnszbkeuerjcevjvdqme:${encodedPassword}@aws-0-us-east-1.pooler.supabase.com:6543/postgres"

Write-Host "`nDATABASE_URL: $databaseUrl" -ForegroundColor Yellow

# Lê o arquivo .env
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile
    
    # Substitui a linha DATABASE_URL
    $newContent = @()
    $found = $false
    
    foreach ($line in $envContent) {
        if ($line -match "^DATABASE_URL=") {
            $newContent += "DATABASE_URL=$databaseUrl"
            $found = $true
            Write-Host "`n✅ DATABASE_URL atualizada no .env" -ForegroundColor Green
        } else {
            $newContent += $line
        }
    }
    
    if (-not $found) {
        $newContent += "DATABASE_URL=$databaseUrl"
        Write-Host "`n✅ DATABASE_URL adicionada no .env" -ForegroundColor Green
    }
    
    # Escreve o arquivo atualizado
    $newContent | Set-Content $envFile -Encoding UTF8
    
    Write-Host "`n✅ Arquivo .env atualizado com sucesso!`n" -ForegroundColor Green
} else {
    Write-Host "❌ Arquivo .env não encontrado!" -ForegroundColor Red
    exit 1
}


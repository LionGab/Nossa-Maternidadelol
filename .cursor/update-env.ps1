# Script para atualizar variáveis de ambiente no .env
# Adiciona/atualiza as variáveis dos MCPs

param(
    [string]$GitHubToken = "",
    [string]$VercelKey = "",
    [string]$DatabaseUrl = ""
)

$envFile = ".env"

# Verifica se .env existe, se não, cria
if (-not (Test-Path $envFile)) {
    Write-Host "📝 Criando arquivo .env..." -ForegroundColor Cyan
    New-Item -Path $envFile -ItemType File -Force | Out-Null
}

Write-Host "`n🔧 Atualizando variáveis de ambiente no .env...`n" -ForegroundColor Cyan

# Lê conteúdo atual do .env
$envContent = @()
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile -ErrorAction SilentlyContinue
}

# Função para atualizar ou adicionar variável
function Update-EnvVariable {
    param(
        [string]$Key,
        [string]$Value,
        [string[]]$Content
    )
    
    $found = $false
    $newContent = @()
    
    foreach ($line in $Content) {
        if ($line -match "^${Key}=") {
            $newContent += "${Key}=${Value}"
            $found = $true
            Write-Host "   ✅ ${Key} atualizada" -ForegroundColor Green
        } else {
            $newContent += $line
        }
    }
    
    if (-not $found) {
        $newContent += "${Key}=${Value}"
        Write-Host "   ✅ ${Key} adicionada" -ForegroundColor Green
    }
    
    return $newContent
}

# Atualiza GitHub token
if ($GitHubToken) {
    $envContent = Update-EnvVariable -Key "GITHUB_PERSONAL_ACCESS_TOKEN" -Value $GitHubToken -Content $envContent
}

# Atualiza Vercel key
if ($VercelKey) {
    $envContent = Update-EnvVariable -Key "VERCEL_API_KEY" -Value $VercelKey -Content $envContent
}

# Atualiza DATABASE_URL
if ($DatabaseUrl) {
    # Corrige /postgre para /postgres se necessário
    $DatabaseUrl = $DatabaseUrl -replace "/postgre$", "/postgres"
    
    # Se a senha contém @, precisa ser URL encoded
    if ($DatabaseUrl -match "\[YOUR_PASSWORD\]") {
        Write-Host "   ⚠️  DATABASE_URL contém [YOUR_PASSWORD] - substitua pela senha real" -ForegroundColor Yellow
    }
    
    # Se a senha contém @ sem encoding, precisa codificar
    if ($DatabaseUrl -match "postgres\.mnszbkeuerjcevjvdqme:([^@]+)@") {
        $currentPassword = $Matches[1]
        # Se a senha tem @ literal (não codificado), precisa codificar
        if ($currentPassword -match "@" -and $currentPassword -notmatch "%40") {
            $encodedPassword = [System.Uri]::EscapeDataString($currentPassword)
            $DatabaseUrl = $DatabaseUrl -replace "postgres\.mnszbkeuerjcevjvdqme:[^@]+@", "postgres.mnszbkeuerjcevjvdqme:$encodedPassword@"
            Write-Host "   ✅ Senha codificada (contém caracteres especiais)" -ForegroundColor Green
        }
    }
    
    $envContent = Update-EnvVariable -Key "DATABASE_URL" -Value $DatabaseUrl -Content $envContent
}

# Escreve conteúdo atualizado
$envContent | Set-Content $envFile -Encoding UTF8

Write-Host "`n✅ Arquivo .env atualizado com sucesso!`n" -ForegroundColor Green

# Verifica se DATABASE_URL tem [YOUR_PASSWORD]
if ($DatabaseUrl -and $DatabaseUrl -match "\[YOUR_PASSWORD\]") {
    Write-Host "⚠️  ATENÇÃO: DATABASE_URL contém [YOUR_PASSWORD]" -ForegroundColor Yellow
    Write-Host "   Você precisa substituir pela senha real do Supabase PostgreSQL" -ForegroundColor Yellow
    Write-Host "   Obtenha a senha em: https://supabase.com/dashboard" -ForegroundColor Yellow
    Write-Host "   Projeto: mnszbkeuerjcevjvdqme" -ForegroundColor Yellow
    Write-Host "   Settings → Database → Connection String`n" -ForegroundColor Yellow
}

Write-Host "📋 Variáveis configuradas:" -ForegroundColor Cyan
if ($GitHubToken) {
    Write-Host "   • GITHUB_PERSONAL_ACCESS_TOKEN" -ForegroundColor Gray
}
if ($VercelKey) {
    Write-Host "   • VERCEL_API_KEY" -ForegroundColor Gray
}
if ($DatabaseUrl) {
    Write-Host "   • DATABASE_URL" -ForegroundColor Gray
}

Write-Host "`n💡 Próximos passos:" -ForegroundColor Cyan
Write-Host "   1. Verifique se DATABASE_URL tem a senha correta" -ForegroundColor Gray
Write-Host "   2. Reinicie o Cursor para carregar os MCPs" -ForegroundColor Gray
Write-Host "   3. Teste os MCPs no chat do Claude`n" -ForegroundColor Gray


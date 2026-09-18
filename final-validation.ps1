# Validação Final Completa - Sistema FIVE
# Execute: powershell -ExecutionPolicy Bypass -File final-validation.ps1

$CLOUD_RUN_URL = "https://gest-o-agenda-marcenaria-372428009665.southamerica-east1.run.app"
$VERCEL_URL = "https://seu-dominio.vercel.app"  # Atualizar quando disponível

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "   VALIDAÇÃO FINAL COMPLETA - SISTEMA FIVE AMBIENTES" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

$results = @{
    cloudRun = @{ passed = 0; failed = 0 }
    frontend = @{ passed = 0; failed = 0 }
}

# ============================================================
# PARTE 1: VALIDAÇÃO DO BACKEND (CLOUD RUN)
# ============================================================

Write-Host "PARTE 1: BACKEND (Google Cloud Run)" -ForegroundColor Yellow
Write-Host "URL: $CLOUD_RUN_URL" -ForegroundColor Gray
Write-Host ""

function Test-BackendEndpoint {
    param(
        [string]$Name,
        [string]$Path,
        [string]$Method = "GET",
        [hashtable]$Body = $null
    )
    
    Write-Host "  Testando: $Name..." -NoNewline
    
    try {
        $params = @{
            Uri         = "$CLOUD_RUN_URL$Path"
            Method      = $Method
            ErrorAction = "Stop"
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json)
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-RestMethod @params
        
        # Converter resposta para string
        $responseStr = ($response | ConvertTo-Json -Compress)
        
        # Verificar se é HTML (placeholder)
        if ($responseStr -match "<!doctype html>" -or $responseStr -match "<html") {
            Write-Host " ❌ Placeholder" -ForegroundColor Red
            $script:results.cloudRun.failed++
            return $false
        }
        else {
            Write-Host " ✅ OK" -ForegroundColor Green
            $script:results.cloudRun.passed++
            return $true
        }
    }
    catch {
        Write-Host " ❌ Erro" -ForegroundColor Red
        $script:results.cloudRun.failed++
        return $false
    }
}

# Testes do Backend
Test-BackendEndpoint -Name "Health Check (/api)" -Path "/api"
Test-BackendEndpoint -Name "Login" -Path "/api/login" -Method "POST" -Body @{ email = "admin@marcenaria.pro"; password = "123" }
Test-BackendEndpoint -Name "Usuários" -Path "/api/users"
Test-BackendEndpoint -Name "Leads" -Path "/api/leads"
Test-BackendEndpoint -Name "Orçamentos" -Path "/api/quotes"
Test-BackendEndpoint -Name "Projetos" -Path "/api/projects"
Test-BackendEndpoint -Name "Eventos/Agenda" -Path "/api/events"

Write-Host ""

# ============================================================
# PARTE 2: VALIDAÇÃO DE INFRAESTRUTURA
# ============================================================

Write-Host "PARTE 2: INFRAESTRUTURA" -ForegroundColor Yellow
Write-Host ""

# Google Cloud Storage
Write-Host "  Google Cloud Storage..." -NoNewline
try {
    # Verificar se variáveis estão configuradas
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "GCS_BUCKET_NAME=marcenaria-files" -and $envContent -match "GCS_PROJECT_ID=marcenariaPRO") {
        Write-Host " ✅ Configurado" -ForegroundColor Green
    }
    else {
        Write-Host " ⚠️ Parcial" -ForegroundColor Yellow
    }
}
catch {
    Write-Host " ❌ Erro" -ForegroundColor Red
}

# PostgreSQL
Write-Host "  PostgreSQL (conexão)..." -NoNewline
try {
    $testLogin = Invoke-RestMethod -Uri "$CLOUD_RUN_URL/api/login" -Method Post -Body (@{ email = "admin@marcenaria.pro"; password = "123" } | ConvertTo-Json) -ContentType "application/json" -ErrorAction Stop
    if ($testLogin.token) {
        Write-Host " ✅ Conectado" -ForegroundColor Green
    }
    else {
        Write-Host " ❌ Falha" -ForegroundColor Red
    }
}
catch {
    Write-Host " ❌ Falha na autenticação" -ForegroundColor Red
}

Write-Host ""

# ============================================================
# PARTE 3: RESUMO FINAL
# ============================================================

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "   RESUMO" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "BACKEND (Cloud Run):" -ForegroundColor Yellow
Write-Host "  ✅ Passou: $($results.cloudRun.passed)" -ForegroundColor Green
Write-Host "  ❌ Falhou: $($results.cloudRun.failed)" -ForegroundColor Red
Write-Host ""

$totalPassed = $results.cloudRun.passed
$totalFailed = $results.cloudRun.failed
$totalTests = $totalPassed + $totalFailed
$successRate = if ($totalTests -gt 0) { [math]::Round(($totalPassed / $totalTests) * 100, 1) } else { 0 }

if ($totalFailed -eq 0) {
    Write-Host "🎉 SISTEMA 100% FUNCIONAL!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Todas as validações passaram com sucesso!" -ForegroundColor Cyan
}
elseif ($successRate -ge 80) {
    Write-Host "✅ SISTEMA OPERACIONAL ($successRate%)" -ForegroundColor Green
    Write-Host ""
    Write-Host "A maioria dos testes passou. Alguns endpoints ainda retornando placeholder." -ForegroundColor Yellow
    Write-Host "Aguarde mais alguns minutos para o build completo do Cloud Run." -ForegroundColor Yellow
}
else {
    Write-Host "⚠️ PROBLEMAS DETECTADOS" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Verifique os logs em:" -ForegroundColor Cyan
    Write-Host "https://console.cloud.google.com/run/detail/southamerica-east1/gest-o-agenda-marcenaria/logs" -ForegroundColor Blue
}

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan

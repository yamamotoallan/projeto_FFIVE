# Validação Completa do Sistema - Frontend + Backend
# Execute: powershell -ExecutionPolicy Bypass -File validate-full-system.ps1

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "   VALIDAÇÃO COMPLETA - SISTEMA FIVE AMBIENTES" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# URLs
$VERCEL_URL = Read-Host "Digite a URL da Vercel (ex: https://projeto.vercel.app)"
$API_URL = "https://gest-o-agenda-marcenaria-372428009665.southamerica-east1.run.app"

$results = @{
    frontend    = @{ passed = 0; failed = 0 }
    backend     = @{ passed = 0; failed = 0 }
    integration = @{ passed = 0; failed = 0 }
}

Write-Host "PARTE 1: FRONTEND (Vercel)" -ForegroundColor Yellow
Write-Host "URL: $VERCEL_URL" -ForegroundColor Gray
Write-Host ""

# Teste 1: Frontend carrega
Write-Host "  Testando: Página principal..." -NoNewline
try {
    $response = Invoke-WebRequest -Uri $VERCEL_URL -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host " ✅ OK" -ForegroundColor Green
        $results.frontend.passed++
    }
    else {
        Write-Host " ❌ Erro $($response.StatusCode)" -ForegroundColor Red
        $results.frontend.failed++
    }
}
catch {
    Write-Host " ❌ Erro de conexão" -ForegroundColor Red
    $results.frontend.failed++
}

# Teste 2: Arquivos estáticos
Write-Host "  Testando: Assets (JS/CSS)..." -NoNewline
try {
    $htmlContent = (Invoke-WebRequest -Uri $VERCEL_URL -UseBasicParsing).Content
    if ($htmlContent -match "index.*\.js" -or $htmlContent -match "main.*\.js") {
        Write-Host " ✅ OK" -ForegroundColor Green
        $results.frontend.passed++
    }
    else {
        Write-Host " ⚠️ Assets não encontrados" -ForegroundColor Yellow
        $results.frontend.failed++
    }
}
catch {
    Write-Host " ❌ Erro" -ForegroundColor Red
    $results.frontend.failed++
}

Write-Host ""
Write-Host "PARTE 2: BACKEND (Cloud Run)" -ForegroundColor Yellow
Write-Host "URL: $API_URL" -ForegroundColor Gray
Write-Host ""

# Teste 3: API Health
Write-Host "  Testando: Health check (/api)..." -NoNewline
try {
    $response = Invoke-RestMethod -Uri "$API_URL/api" -Method Get
    if ($response.status -eq "API Online") {
        Write-Host " ✅ OK" -ForegroundColor Green
        $results.backend.passed++
    }
    else {
        Write-Host " ❌ Resposta inesperada" -ForegroundColor Red
        $results.backend.failed++
    }
}
catch {
    Write-Host " ❌ Erro" -ForegroundColor Red
    $results.backend.failed++
}

# Teste 4: Endpoints principais
$endpoints = @(
    @{name = "Leads"; path = "/api/leads" },
    @{name = "Quotes"; path = "/api/quotes" },
    @{name = "Projects"; path = "/api/projects" },
    @{name = "Events"; path = "/api/events" },
    @{name = "SMTP Config"; path = "/api/settings/mail" }
)

foreach ($endpoint in $endpoints) {
    Write-Host "  Testando: $($endpoint.name)..." -NoNewline
    try {
        $response = Invoke-RestMethod -Uri "$API_URL$($endpoint.path)" -Method Get -ErrorAction Stop
        Write-Host " ✅ OK" -ForegroundColor Green
        $results.backend.passed++
    }
    catch {
        Write-Host " ❌ Erro" -ForegroundColor Red
        $results.backend.failed++
    }
}

Write-Host ""
Write-Host "PARTE 3: INTEGRAÇÃO" -ForegroundColor Yellow
Write-Host ""

# Teste 5: CORS
Write-Host "  Testando: CORS..." -NoNewline
try {
    $headers = @{
        "Origin" = $VERCEL_URL
    }
    $response = Invoke-WebRequest -Uri "$API_URL/api" -Headers $headers -UseBasicParsing
    $corsHeader = $response.Headers["Access-Control-Allow-Origin"]
    
    if ($corsHeader) {
        Write-Host " ✅ OK" -ForegroundColor Green
        $results.integration.passed++
    }
    else {
        Write-Host " ⚠️ Header CORS ausente" -ForegroundColor Yellow
        $results.integration.failed++
    }
}
catch {
    Write-Host " ❌ Erro" -ForegroundColor Red
    $results.integration.failed++
}

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "   RESUMO" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

$totalPassed = $results.frontend.passed + $results.backend.passed + $results.integration.passed
$totalFailed = $results.frontend.failed + $results.backend.failed + $results.integration.failed
$totalTests = $totalPassed + $totalFailed

Write-Host "FRONTEND:" -ForegroundColor Yellow
Write-Host "  ✅ Passou: $($results.frontend.passed)" -ForegroundColor Green
Write-Host "  ❌ Falhou: $($results.frontend.failed)" -ForegroundColor Red
Write-Host ""

Write-Host "BACKEND:" -ForegroundColor Yellow
Write-Host "  ✅ Passou: $($results.backend.passed)" -ForegroundColor Green
Write-Host "  ❌ Falhou: $($results.backend.failed)" -ForegroundColor Red
Write-Host ""

Write-Host "INTEGRAÇÃO:" -ForegroundColor Yellow
Write-Host "  ✅ Passou: $($results.integration.passed)" -ForegroundColor Green
Write-Host "  ❌ Falhou: $($results.integration.failed)" -ForegroundColor Red
Write-Host ""

$successRate = if ($totalTests -gt 0) { [math]::Round(($totalPassed / $totalTests) * 100, 1) } else { 0 }

Write-Host "TOTAL: $totalPassed/$totalTests testes passaram ($successRate%)" -ForegroundColor Cyan
Write-Host ""

if ($totalFailed -eq 0) {
    Write-Host "🎉 SISTEMA 100% FUNCIONAL!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Próximos passos:" -ForegroundColor Cyan
    Write-Host "1. Acesse: $VERCEL_URL"
    Write-Host "2. Login: admin@marcenaria.pro / 123"
    Write-Host "3. Teste todas as funcionalidades"
}
else {
    Write-Host "⚠️ Alguns testes falharam" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Verifique:" -ForegroundColor Cyan
    Write-Host "- Frontend: $VERCEL_URL"
    Write-Host "- Backend: $API_URL"
    Write-Host "- Variável VITE_API_URL está correta?"
}

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan

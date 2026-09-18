# Script de Validação Completa do Sistema
# Testa todos os endpoints e funcionalidades principais

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   VALIDAÇÃO COMPLETA DO SISTEMA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$API_URL = "https://gest-o-agenda-marcenaria-372428009665.southamerica-east1.run.app"
$FRONTEND_URL = "https://gest-o-agenda-marcenaria.vercel.app"

$passed = 0
$failed = 0
$warnings = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [object]$Body = $null
    )
    
    Write-Host "  $Name..." -NoNewline
    
    try {
        $params = @{
            Uri             = $Url
            Method          = $Method
            UseBasicParsing = $true
            TimeoutSec      = 10
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json)
            $params.Headers = @{"Content-Type" = "application/json" }
        }
        
        $response = Invoke-WebRequest @params
        
        if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 201) {
            Write-Host " ✅ OK" -ForegroundColor Green
            $script:passed++
            return $true
        }
        else {
            Write-Host " ⚠️ Status $($response.StatusCode)" -ForegroundColor Yellow
            $script:warnings++
            return $false
        }
    }
    catch {
        Write-Host " ❌ ERRO" -ForegroundColor Red
        Write-Host "    $($_.Exception.Message)" -ForegroundColor Gray
        $script:failed++
        return $false
    }
}

Write-Host "PARTE 1: VALIDAÇÃO DE INFRAESTRUTURA" -ForegroundColor Yellow
Write-Host ""

# Frontend
Test-Endpoint "Frontend (Vercel)" $FRONTEND_URL

# Backend Health
Test-Endpoint "Backend Health" "$API_URL/api"

Write-Host ""
Write-Host "PARTE 2: ENDPOINTS DE DADOS" -ForegroundColor Yellow
Write-Host ""

# Endpoints principais
Test-Endpoint "Leads API" "$API_URL/api/leads"
Test-Endpoint "Quotes API" "$API_URL/api/quotes"
Test-Endpoint "Projects API" "$API_URL/api/projects"
Test-Endpoint "Events API" "$API_URL/api/events"
Test-Endpoint "Users API" "$API_URL/api/users"

Write-Host ""
Write-Host "PARTE 3: NOTIFICAÇÕES" -ForegroundColor Yellow
Write-Host ""

Test-Endpoint "Notifications API" "$API_URL/api/notifications"

Write-Host ""
Write-Host "PARTE 4: ANALYTICS" -ForegroundColor Yellow
Write-Host ""

Test-Endpoint "Conversion Rate" "$API_URL/api/analytics/conversion"
Test-Endpoint "Avg Time" "$API_URL/api/analytics/avg-time"
Test-Endpoint "Ticket" "$API_URL/api/analytics/ticket"
Test-Endpoint "Revenue" "$API_URL/api/analytics/revenue"
Test-Endpoint "Funnel" "$API_URL/api/analytics/funnel"
Test-Endpoint "Comparison" "$API_URL/api/analytics/comparison"
Test-Endpoint "Summary" "$API_URL/api/analytics/summary"

Write-Host ""
Write-Host "PARTE 5: CONFIGURAÇÕES" -ForegroundColor Yellow
Write-Host ""

Test-Endpoint "Mail Settings" "$API_URL/api/settings/mail"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   RESUMO DA VALIDAÇÃO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$total = $passed + $failed + $warnings
$passRate = if ($total -gt 0) { [math]::Round(($passed / $total) * 100, 1) } else { 0 }

Write-Host "Testes Executados: $total" -ForegroundColor Cyan
Write-Host "  ✅ Passou: $passed" -ForegroundColor Green
Write-Host "  ⚠️ Avisos: $warnings" -ForegroundColor Yellow
Write-Host "  ❌ Falhou: $failed" -ForegroundColor Red
Write-Host ""
Write-Host "Taxa de Sucesso: $passRate%" -ForegroundColor Cyan
Write-Host ""

if ($failed -eq 0) {
    Write-Host "🎉 TODOS OS TESTES PASSARAM!" -ForegroundColor Green
    exit 0
}
else {
    Write-Host "⚠️ ALGUNS TESTES FALHARAM" -ForegroundColor Yellow
    exit 1
}

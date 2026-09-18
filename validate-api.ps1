# Validação Completa da API - Cloud Run
# Execute: .\validate-api.ps1

$BASE_URL = "https://gest-o-agenda-marcenaria-372428009665.southamerica-east1.run.app"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "   VALIDAÇÃO COMPLETA DA API - CLOUD RUN" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

$results = @{
    passed = 0
    failed = 0
}

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Path,
        [hashtable]$Body = $null,
        [string]$ExpectedType = "json"
    )
    
    Write-Host "Testando: $Name" -ForegroundColor Yellow
    Write-Host "  Método: $Method $Path" -ForegroundColor Gray
    
    try {
        $params = @{
            Uri         = "$BASE_URL$Path"
            Method      = $Method
            ErrorAction = "Stop"
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json)
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-RestMethod @params
        
        # Verificar se é JSON ou HTML
        $responseStr = $response | ConvertTo-Json -Compress
        
        if ($responseStr -like "*<!doctype html>*" -or $responseStr -like "*<html*") {
            Write-Host "  ❌ FALHOU - Retornou HTML (placeholder)" -ForegroundColor Red
            $script:results.failed++
        }
        else {
            Write-Host "  ✅ SUCESSO" -ForegroundColor Green
            Write-Host "  Resposta: $($responseStr.Substring(0, [Math]::Min(100, $responseStr.Length)))..." -ForegroundColor Gray
            $script:results.passed++
            return $response
        }
    }
    catch {
        Write-Host "  ❌ ERRO: $($_.Exception.Message)" -ForegroundColor Red
        $script:results.failed++
    }
    
    Write-Host ""
    return $null
}

# 1. Health Check
$healthResponse = Test-Endpoint -Name "Health Check" -Method "GET" -Path "/api"

# 2. Login
$loginResponse = Test-Endpoint -Name "Login" -Method "POST" -Path "/api/login" -Body @{
    email    = "admin@marcenaria.pro"
    password = "123"
}

# 3. Usuários
Test-Endpoint -Name "Listar Usuários" -Method "GET" -Path "/api/users"

# 4. Leads  
$leadsResponse = Test-Endpoint -Name "Listar Leads" -Method "GET" -Path "/api/leads"

# 5. Orçamentos
Test-Endpoint -Name "Listar Orçamentos" -Method "GET" -Path "/api/quotes"

# 6. Projetos
Test-Endpoint -Name "Listar Projetos" -Method "GET" -Path "/api/projects"

# 7. Eventos/Agenda
Test-Endpoint -Name "Listar Eventos" -Method "GET" -Path "/api/events"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "   RESUMO DOS TESTES" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "✅ Passou: $($results.passed)" -ForegroundColor Green
Write-Host "❌ Falhou: $($results.failed)" -ForegroundColor Red
Write-Host ""

if ($results.failed -eq 0) {
    Write-Host "🎉 TODOS OS TESTES PASSARAM!" -ForegroundColor Green
    Write-Host ""
    Write-Host "API está funcionando corretamente!" -ForegroundColor Cyan
    Write-Host "URL: $BASE_URL" -ForegroundColor Yellow
}
else {
    Write-Host "⚠️ Alguns testes falharam." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Verifique os logs em:" -ForegroundColor Cyan
    Write-Host "https://console.cloud.google.com/run/detail/southamerica-east1/gest-o-agenda-marcenaria-372428009665/logs" -ForegroundColor Blue
}

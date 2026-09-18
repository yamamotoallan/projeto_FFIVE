# Script de Diagnóstico Completo do Sistema
# Testa todas as conexões: Frontend, Backend, Banco de Dados

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   DIAGNÓSTIC System Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$results = @()

# Teste 1: Backend Health Check
Write-Host "1. Testando Backend (Cloud Run)..." -ForegroundColor Yellow
try {
    $backendUrl = "https://gest-o-agenda-marcenaria-372428009665.southamerica-east1.run.app/api"
    $response = Invoke-RestMethod -Uri $backendUrl -Method GET -TimeoutSec 10
    
    if ($response.status -eq "API Online") {
        Write-Host "   ✅ Backend OK: $($response.status)" -ForegroundColor Green
        $results += "Backend: OK"
    } else {
        Write-Host "   ❌ Backend resposta inesperada" -ForegroundColor Red
        $results += "Backend: ERRO"
    }
} catch {
    Write-Host "   ❌ Backend OFFLINE: $($_.Exception.Message)" -ForegroundColor Red
    $results += "Backend: OFFLINE"
}

Write-Host ""

# Teste 2: Frontend (Vercel)
Write-Host "2. Testando Frontend (Vercel)..." -ForegroundColor Yellow
try {
    $frontendUrl = "https://gest-o-agenda-marcenaria.vercel.app"
    $response = Invoke-WebRequest -Uri $frontendUrl -Method GET -TimeoutSec 10
    
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Frontend OK (HTTP 200)" -ForegroundColor Green
        $results += "Frontend: OK"
        
        # Verificar se HTML contém a API URL correta
        if ($response.Content -match "gest-o-agenda-marcenaria.*run\.app") {
            Write-Host "   ✅ Frontend contém referência ao Cloud Run" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  Frontend pode não ter API URL configurada" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "   ❌ Frontend OFFLINE: $($_.Exception.Message)" -ForegroundColor Red
    $results += "Frontend: OFFLINE"
}

Write-Host ""

# Teste 3: Login Endpoint
Write-Host "3. Testando Login Endpoint..." -ForegroundColor Yellow
try {
    $loginUrl = "https://gest-o-agenda-marcenaria-372428009665.southamerica-east1.run.app/api/login"
    $body = @{
        email = "admin@marcenaria.pro"
        password = "123"
    } | ConvertTo-Json
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    $response = Invoke-RestMethod -Uri $loginUrl -Method POST -Body $body -Headers $headers -TimeoutSec 10
    
    if ($response.success) {
        Write-Host "   ✅ Login OK: Token recebido" -ForegroundColor Green
        $results += "Login: OK"
        $token = $response.token
        Write-Host "   Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
    } else {
        Write-Host "   ❌ Login falhou: $($response.message)" -ForegroundColor Red
        $results += "Login: FALHOU"
    }
} catch {
    Write-Host "   ❌ Login endpoint erro: $($_.Exception.Message)" -ForegroundColor Red
    $results += "Login: ERRO"
}

Write-Host ""

# Teste 4: Leads Endpoint (requer autenticação)
Write-Host "4. Testando Leads Endpoint..." -ForegroundColor Yellow
try {
    $leadsUrl = "https://gest-o-agenda-marcenaria-372428009665.southamerica-east1.run.app/api/leads"
    $response = Invoke-RestMethod -Uri $leadsUrl -Method GET -TimeoutSec 10
    
    Write-Host "   ✅ Leads endpoint respondeu" -ForegroundColor Green
    Write-Host "   Total de leads: $(if ($response.Count) { $response.Count } else { 'array vazio ou não-array' })" -ForegroundColor Gray
    $results += "Leads: OK"
} catch {
    Write-Host "   ⚠️  Leads endpoint erro (pode precisar auth): $($_.Exception.Message)" -ForegroundColor Yellow
    $results += "Leads: Precisa Auth"
}

Write-Host ""

# Teste 5: CORS e Headers
Write-Host "5. Testando CORS..." -ForegroundColor Yellow
try {
    $headers = @{
        "Origin" = "https://gest-o-agenda-marcenaria.vercel.app"
    }
    $response = Invoke-WebRequest -Uri "https://gest-o-agenda-marcenaria-372428009665.southamerica-east1.run.app/api" -Headers $headers -Method GET -TimeoutSec 10
    
    $corsHeader = $response.Headers["Access-Control-Allow-Origin"]
    if ($corsHeader) {
        Write-Host "   ✅ CORS configurado: $corsHeader" -ForegroundColor Green
        $results += "CORS: OK"
    } else {
        Write-Host "   ⚠️  CORS header não encontrado" -ForegroundColor Yellow
        $results += "CORS: Não encontrado"
    }
} catch {
    Write-Host "   ❌ CORS teste falhou: $($_.Exception.Message)" -ForegroundColor Red
    $results += "CORS: ERRO"
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   RESUMO DOS TESTES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

foreach ($result in $results) {
    Write-Host "  $result" -ForegroundColor White
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Diagnóstico
$backendOk = $results -contains "Backend: OK"
$loginOk = $results -contains "Login: OK"

if ($backendOk -and $loginOk) {
    Write-Host "✅ BACKEND ESTÁ FUNCIONANDO CORRETAMENTE!" -ForegroundColor Green
    Write-Host ""
    Write-Host "O problema está no FRONTEND (Vercel)." -ForegroundColor Yellow
    Write-Host "Possíveis causas:" -ForegroundColor Yellow
    Write-Host "  1. Build do Vercel não incluiu as mudanças" -ForegroundColor Gray
    Write-Host "  2. Cache do navegador" -ForegroundColor Gray
    Write-Host "  3. Frontend ainda aponta para localhost" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Solução: Forçar rebuild no Vercel ou limpar cache" -ForegroundColor Cyan
} elseif ($backendOk -and -not $loginOk) {
    Write-Host "⚠️  Backend OK mas Login falhou" -ForegroundColor Yellow
    Write-Host "Verifique credenciais no banco de dados" -ForegroundColor Gray
} else {
    Write-Host "❌ BACKEND OFFLINE!" -ForegroundColor Red
    Write-Host "Cloud Run não está respondendo" -ForegroundColor Gray
}

Write-Host ""

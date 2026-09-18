# Script de Teste da API - Cloud Run
# Execute: .\test-api.ps1

$BASE_URL = "https://gest-o-agenda-marcenaria-372428009665.southamerica-east1.run.app"

Write-Host "Testando API do Cloud Run..." -ForegroundColor Cyan
Write-Host "URL: $BASE_URL" -ForegroundColor Yellow
Write-Host ""

# Teste 1: Health Check
Write-Host "1. Health Check (GET /api)..." -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api" -Method Get -ErrorAction Stop
    Write-Host "   Sucesso!" -ForegroundColor Green
    $response | ConvertTo-Json
}
catch {
    Write-Host "   Erro: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
}

Write-Host ""

# Teste 2: Login
Write-Host "2. Login (POST /api/login)..." -ForegroundColor Green
try {
    $body = @{
        email    = "admin@marcenaria.pro"
        password = "123"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$BASE_URL/api/login" -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
    Write-Host "   Sucesso!" -ForegroundColor Green
    Write-Host "   Token: $($response.token.Substring(0,50))..." -ForegroundColor Cyan
}
catch {
    Write-Host "   Erro: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Teste 3: Listar Leads
Write-Host "3. Listar Leads (GET /api/leads)..." -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/leads" -Method Get -ErrorAction Stop
    Write-Host "   Sucesso! Total de leads: $($response.Count)" -ForegroundColor Green
}
catch {
    Write-Host "   Erro: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Testes concluidos!" -ForegroundColor Cyan

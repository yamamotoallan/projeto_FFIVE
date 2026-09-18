# ============================================
# TESTE COMPLETO - API FINANCEIRA
# ============================================
# Execute: powershell -File test_all_financial.ps1

$API_URL = "https://gest-o-agenda-marcenaria-production.up.railway.app"
$TOKEN = Read-Host "Cole seu TOKEN do localStorage aqui"

Write-Host "`n=== TESTANDO TODOS OS ENDPOINTS FINANCEIROS ===`n" -ForegroundColor Cyan

# Headers
$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type"  = "application/json"
}

# Teste 1: Categories
Write-Host "1. GET /api/financial/categories" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$API_URL/api/financial/categories" -Headers $headers -Method GET
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ SUCCESS - $($data.Length) categorias retornadas" -ForegroundColor Green
    $data | Select-Object -First 3 | Format-Table id, name, type
}
catch {
    Write-Host "❌ ERRO: $($_.Exception.Message)" -ForegroundColor Red
}

# Teste 2: Bank Accounts
Write-Host "`n2. GET /api/financial/bank-accounts" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$API_URL/api/financial/bank-accounts" -Headers $headers -Method GET
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ SUCCESS - $($data.Length) contas retornadas" -ForegroundColor Green
    $data | Format-Table id, name, account_type
}
catch {
    Write-Host "❌ ERRO: $($_.Exception.Message)" -ForegroundColor Red
}

# Teste 3: Summary
Write-Host "`n3. GET /api/financial/summary" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$API_URL/api/financial/summary?date_from=2026-01-01&date_to=2026-12-31" -Headers $headers -Method GET
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ SUCCESS" -ForegroundColor Green
    Write-Host "Receitas: R$ $($data.summary.total_income)"
    Write-Host "Despesas: R$ $($data.summary.total_expense)"
}
catch {
    Write-Host "❌ ERRO: $($_.Exception.Message)" -ForegroundColor Red
}

# Teste 4: Transactions
Write-Host "`n4. GET /api/financial/transactions" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$API_URL/api/financial/transactions?date_from=2026-01-01&date_to=2026-12-31" -Headers $headers -Method GET
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ SUCCESS - $($data.Length) transações" -ForegroundColor Green
}
catch {
    Write-Host "❌ ERRO: $($_.Exception.Message)" -ForegroundColor Red
}

# Teste 5: Receivables
Write-Host "`n5. GET /api/financial/receivables" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$API_URL/api/financial/receivables" -Headers $headers -Method GET
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ SUCCESS - $($data.Length) parcelas" -ForegroundColor Green
}
catch {
    Write-Host "❌ ERRO: $($_.Exception.Message)" -ForegroundColor Red
}

# Teste 6: Payables
Write-Host "`n6. GET /api/financial/payables" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$API_URL/api/financial/payables" -Headers $headers -Method GET
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ SUCCESS - $($data.Length) contas" -ForegroundColor Green
}
catch {
    Write-Host "❌ ERRO: $($_.Exception.Message)" -ForegroundColor Red
}

# Teste 7: Suppliers
Write-Host "`n7. GET /api/financial/suppliers" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$API_URL/api/financial/suppliers" -Headers $headers -Method GET
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ SUCCESS - $($data.Length) fornecedores" -ForegroundColor Green
}
catch {
    Write-Host "❌ ERRO: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== TESTE COMPLETO ===" -ForegroundColor Cyan

# Script de teste automático para backend Marcenaria Pro
$ErrorActionPreference = "Continue"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   TESTE AUTOMÁTICO - SISTEMA MARCENARIA PRO" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

$BASE_URL = "https://gest-o-agenda-marcenaria-production.up.railway.app"

# Test 1: Health Check
Write-Host "`n📊 Test 1: Health Check" -ForegroundColor Yellow
Write-Host "------------------------------------------------------------"
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/health" -UseBasicParsing
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)"
    
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Health check PASSOU" -ForegroundColor Green
    }
}
catch {
    Write-Host "❌ Health check FALHOU: $_" -ForegroundColor Red
}

# Test 2: Login
Write-Host "`n🔐 Test 2: Login" -ForegroundColor Yellow
Write-Host "------------------------------------------------------------"
$token = $null
try {
    $body = @{
        email    = "admin@admin.com"
        password = "123456"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$BASE_URL/api/login" `
        -Method POST `
        -Body $body `
        -ContentType "application/json" `
        -UseBasicParsing
    
    $result = $response.Content | ConvertFrom-Json
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)"
    
    if ($result.token) {
        $token = $result.token
        Write-Host "✅ Login PASSOU - Token obtido" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Login FALHOU - Sem token" -ForegroundColor Red
    }
}
catch {
    Write-Host "❌ Login FALHOU: $_" -ForegroundColor Red
    Write-Host "Response: $($_.ErrorDetails.Message)" -ForegroundColor Red
}

# Test 3: Tentar criar orçamento (se login funcionou)
if ($token) {
    Write-Host "`n📝 Test 3: Criar Orçamento" -ForegroundColor Yellow
    Write-Host "------------------------------------------------------------"
    try {
        $quoteBody = @{
            client       = "Cliente Teste Auto"
            project      = "Projeto Upload Test"
            value        = 5000
            status       = "Pendente"
            phone        = "(11) 99999-9999"
            project_type = "Cozinha"
            service_type = "Móveis planejados"
            notes        = "Teste automático"
        } | ConvertTo-Json
        
        $headers = @{
            "Authorization" = "Bearer $token"
            "Content-Type"  = "application/json"
        }
        
        $response = Invoke-WebRequest -Uri "$BASE_URL/api/quotes" `
            -Method POST `
            -Headers $headers `
            -Body $quoteBody `
            -UseBasicParsing
        
        $newQuote = $response.Content | ConvertFrom-Json
        Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "Quote criado: ID = $($newQuote.id)" -ForegroundColor Green
        Write-Host "✅ Criação de orçamento PASSOU" -ForegroundColor Green
        
        $quoteId = $newQuote.id
        
        # Test 4: Upload de arquivo
        Write-Host "`n📤 Test 4: Upload de Arquivo" -ForegroundColor Yellow
        Write-Host "------------------------------------------------------------"
        
        # Criar arquivo de teste
        $testFile = "test-upload-$(Get-Date -Format 'yyyyMMddHHmmss').txt"
        "Este é um arquivo de teste para o sistema Marcenaria Pro. Data: $(Get-Date)" | Out-File -FilePath $testFile -Encoding UTF8
        
        Write-Host "Arquivo criado: $testFile"
        Write-Host "Tentando upload para Quote ID: $quoteId"
        
        # Upload usando multipart/form-data
        $boundary = [System.Guid]::NewGuid().ToString()
        $fileContent = [System.IO.File]::ReadAllBytes($testFile)
        $fileName = [System.IO.Path]::GetFileName($testFile)
        
        $bodyLines = @(
            "--$boundary",
            "Content-Disposition: form-data; name=`"files`"; filename=`"$fileName`"",
            "Content-Type: text/plain",
            "",
            [System.Text.Encoding]::UTF8.GetString($fileContent),
            "--$boundary--"
        )
        
        $multipartBody = $bodyLines -join "`r`n"
        
        try {
            $uploadHeaders = @{
                "Authorization" = "Bearer $token"
                "Content-Type"  = "multipart/form-data; boundary=$boundary"
            }
            
            $uploadResponse = Invoke-WebRequest -Uri "$BASE_URL/api/quotes/$quoteId/files" `
                -Method POST `
                -Headers $uploadHeaders `
                -Body $multipartBody `
                -UseBasicParsing
            
            Write-Host "Status: $($uploadResponse.StatusCode)" -ForegroundColor Green
            Write-Host "Response: $($uploadResponse.Content)"
            Write-Host "✅ Upload PASSOU!" -ForegroundColor Green
            
        }
        catch {
            Write-Host "❌ Upload FALHOU: $_" -ForegroundColor Red
            Write-Host "Detalhes: $($_.ErrorDetails.Message)" -ForegroundColor Red
        }
        
        # Cleanup
        Remove-Item $testFile -Force
        
    }
    catch {
        Write-Host "❌ Criação de orçamento FALHOU: $_" -ForegroundColor Red
        Write-Host "Detalhes: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}
else {
    Write-Host "`n⏭️ Tests 3-4: PULADOS (login falhou)" -ForegroundColor Yellow
}

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "TESTE CONCLUÍDO" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

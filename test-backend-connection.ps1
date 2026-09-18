# Teste de Conectividade Backend → Database
# Execute este script para diagnosticar problemas de conexão

Write-Host "=================================" -ForegroundColor Cyan
Write-Host "TESTE DE CONECTIVIDADE BACKEND" -ForegroundColor Cyan  
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Variáveis
$BACKEND_URL = "https://gest-o-agenda-marcenaria-372428009665.southamerica-east1.run.app"
$FRONTEND_URL = "https://gest-o-agenda-marcenaria.vercel.app"

Write-Host "1. Testando se backend está online..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BACKEND_URL/api/leads" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Backend respondeu com status 200" -ForegroundColor Green
        Write-Host "   Dados retornados: $($response.Content.Length) bytes" -ForegroundColor Gray
    }
}
catch {
    Write-Host "   ❌ ERRO ao acessar backend!" -ForegroundColor Red
    Write-Host "   Detalhes: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Message -like "*500*") {
        Write-Host ""
        Write-Host "   🔴 ERRO 500 - Problema no servidor!" -ForegroundColor Red
        Write-Host "   Possíveis causas:" -ForegroundColor Yellow
        Write-Host "   - Banco de dados inacessível" -ForegroundColor Yellow
        Write-Host "   - Variáveis de ambiente faltando" -ForegroundColor Yellow
        Write-Host "   - Código do backend com erro" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "2. Testando frontend..." -ForegroundColor Yellow
try {
    $frontResponse = Invoke-WebRequest -Uri $FRONTEND_URL -UseBasicParsing -TimeoutSec 10
    if ($frontResponse.StatusCode -eq 200) {
        Write-Host "   ✅ Frontend acessível" -ForegroundColor Green
    }
}
catch {
    Write-Host "   ❌ Frontend com problema: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "3. Verificando arquivo .env local..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "   ✅ Arquivo .env existe" -ForegroundColor Green
    Write-Host "   Conteúdo (parcial):" -ForegroundColor Gray
    Get-Content ".env" | Select-String "DB_" | ForEach-Object {
        $line = $_ -replace "@KY89aky", "***SENHA_OCULTA***"
        Write-Host "   $line" -ForegroundColor Gray
    }
}
else {
    Write-Host "   ⚠️  Arquivo .env não encontrado" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "PRÓXIMOS PASSOS" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Se o backend retornou ERRO 500:" -ForegroundColor Yellow
Write-Host "1. Abra: https://console.cloud.google.com/run" -ForegroundColor White
Write-Host "2. Clique em 'gest-o-agenda-marcenaria'" -ForegroundColor White
Write-Host "3. Vá em 'LOGS' para ver os erros" -ForegroundColor White
Write-Host "4. Siga o arquivo FIX-CLOUD-RUN-DB-CONNECTION.md" -ForegroundColor White
Write-Host ""
Write-Host "Se o backend retornou dados (200 OK):" -ForegroundColor Yellow
Write-Host "1. O problema pode estar no frontend" -ForegroundColor White
Write-Host "2. Verifique o console do navegador (F12)" -ForegroundColor White
Write-Host "3. Tente criar um lead e veja o erro exato" -ForegroundColor White
Write-Host ""
Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Teste de Criação de Lead (POST)
# Este script testa especificamente a criação de um novo lead

$BACKEND_URL = "https://gest-o-agenda-marcenaria-372428009665.southamerica-east1.run.app"

Write-Host "=================================" -ForegroundColor Cyan
Write-Host "TESTE DE CRIAÇÃO DE LEAD (POST)" -ForegroundColor Cyan  
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Dados do lead de teste
$leadData = @{
    name    = "Cliente Teste $(Get-Date -Format 'HH:mm:ss')"
    project = "Cozinha Planejada Teste"
    phone   = "(11) 90000-0000"
    email   = "teste@example.com"
    source  = "Teste Manual"
    status  = "Novo"
} | ConvertTo-Json

Write-Host "Tentando criar lead..." -ForegroundColor Yellow
Write-Host "Dados: $leadData" -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-WebRequest `
        -Uri "$BACKEND_URL/api/leads" `
        -Method POST `
        -ContentType "application/json" `
        -Body $leadData `
        -UseBasicParsing `
        -TimeoutSec 15
    
    Write-Host "✅ SUCESSO!" -ForegroundColor Green
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Resposta: $($response.Content)" -ForegroundColor Gray
    
}
catch {
    Write-Host "❌ ERRO ao criar lead!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Detalhes do erro:" -ForegroundColor Yellow
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host ""
        Write-Host "Resposta do servidor:" -ForegroundColor Yellow
        Write-Host $responseBody -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "🔍 PRÓXIMOS PASSOS:" -ForegroundColor Cyan
    Write-Host "1. Verificar logs detalhados no Cloud Run" -ForegroundColor White
    Write-Host "2. Verificar se banco de dados está acessível" -ForegroundColor White
    Write-Host "3. Verificar se tabela 'leads' existe" -ForegroundColor White
    Write-Host "4. Verificar permissões do usuário PostgreSQL" -ForegroundColor White
}

Write-Host ""
Read-Host "Pressione Enter para sair"

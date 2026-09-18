# Script para Deploy do Backend no Google Cloud Run

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   DEPLOY BACKEND - GOOGLE CLOUD" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se está na pasta correta
if (-Not (Test-Path "index.js")) {
    Write-Host "❌ Este script deve ser executado da pasta 'api'" -ForegroundColor Red
    Write-Host "   Execute: cd api" -ForegroundColor Yellow
    exit 1
}

Write-Host "🚀 Iniciando deploy no Google Cloud Run..." -ForegroundColor Yellow
Write-Host ""

try {
    # Deploy no Cloud Run
    gcloud run deploy gest-o-agenda-marcenaria `
        --source . `
        --region southamerica-east1 `
        --platform managed `
        --allow-unauthenticated
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "   ✅ DEPLOY CONCLUÍDO!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Backend disponível em:" -ForegroundColor Yellow
        Write-Host "https://gest-o-agenda-marcenaria-372428009665.southamerica-east1.run.app/api" -ForegroundColor Cyan
        Write-Host ""
    }
    else {
        Write-Host "❌ Erro no deploy" -ForegroundColor Red
        exit 1
    }
    
}
catch {
    Write-Host "❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possíveis soluções:" -ForegroundColor Yellow
    Write-Host "1. Fazer login: gcloud auth login" -ForegroundColor White
    Write-Host "2. Configurar projeto: gcloud config set project seu-project-id" -ForegroundColor White
    exit 1
}

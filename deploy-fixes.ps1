# Script de Deploy Completo - Correções da Agenda
# Execute este script para fazer deploy de TODAS as correções

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   DEPLOY - CORREÇÕES DA AGENDA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Adicionar todas as mudanças
Write-Host "📦 Adicionando mudanças ao Git..." -ForegroundColor Yellow
git add api/index.js
git add components/EventDetailsModal.tsx
git add components/NewAppointmentModal.tsx
git add pages/Agenda.tsx
git add src/services/api.ts

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Mudanças adicionadas" -ForegroundColor Green
}
else {
    Write-Host "❌ Erro ao adicionar mudanças" -ForegroundColor Red
    exit 1
}

# 2. Fazer commit
Write-Host ""
Write-Host "💾 Criando commit..." -ForegroundColor Yellow
$commitMessage = @"
fix(agenda): corrigir validação de data, remover drag-and-drop e reagendamento

Mudanças aplicadas:
- api/index.js: Remover margem de 5 min na validação de data (permite criar eventos hoje com hora futura)
- pages/Agenda.tsx: Corrigir ordem de operações no reagendamento + remover filtro client-side
- components/EventDetailsModal.tsx: Adicionar validações e loading state
- components/NewAppointmentModal.tsx: Validação de time_end > time_start
- src/services/api.ts: Melhor tratamento de erros
"@

git commit -m $commitMessage

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Commit criado" -ForegroundColor Green
}
else {
    Write-Host "❌ Erro ao criar commit" -ForegroundColor Red
    exit 1
}

# 3. Push para GitHub
Write-Host ""
Write-Host "🚀 Enviando para GitHub..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Push enviado para GitHub" -ForegroundColor Green
}
else {
    Write-Host "❌ Erro ao fazer push" -ForegroundColor Red
    exit 1
}

# 4. Informações sobre deploy
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   DEPLOY INICIADO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📱 FRONTEND (Vercel) - Deploy Automático" -ForegroundColor Yellow
Write-Host "   • URL: https://gest-o-agenda-marcenaria.vercel.app" -ForegroundColor Cyan
Write-Host "   • Dashboard: https://vercel.com/dashboard" -ForegroundColor Cyan
Write-Host "   • Tempo estimado: 2-5 minutos" -ForegroundColor Gray
Write-Host ""

Write-Host "🔧 BACKEND (Google Cloud) - Deploy Manual Necessário" -ForegroundColor Yellow
Write-Host "   Execute o seguinte comando:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   cd api" -ForegroundColor White
Write-Host "   gcloud run deploy gest-o-agenda-marcenaria --source . --region southamerica-east1 --allow-unauthenticated" -ForegroundColor White
Write-Host ""
Write-Host "   OU execute: .\deploy-backend.ps1" -ForegroundColor Cyan
Write-Host ""

Write-Host "⏱️  Aguarde o deploy completar e então:" -ForegroundColor Yellow
Write-Host "   1. Limpe o cache do browser (Ctrl+Shift+R)" -ForegroundColor White
Write-Host "   2. Teste criar evento para hoje com hora futura" -ForegroundColor White
Write-Host "   3. Teste reagendar um evento" -ForegroundColor White
Write-Host "   4. Verifique que drag-and-drop foi removido" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

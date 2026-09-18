# Deploy Automático na Vercel - 3 Passos
# Execute: .\deploy-vercel.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   DEPLOY AUTOMÁTICO - VERCEL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Passo 1: Verificar se Vercel CLI está instalado
Write-Host "1. Verificando Vercel CLI..." -ForegroundColor Yellow
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue

if (-not $vercelInstalled) {
    Write-Host "   Vercel CLI não encontrado. Instalando..." -ForegroundColor Yellow
    npm install -g vercel
}
else {
    Write-Host "   ✅ Vercel CLI já instalado" -ForegroundColor Green
}

# Passo 2: Login
Write-Host ""
Write-Host "2. Fazendo login na Vercel..." -ForegroundColor Yellow
Write-Host "   (Uma aba do navegador vai abrir)" -ForegroundColor Gray
vercel login

# Passo 3: Deploy
Write-Host ""
Write-Host "3. Iniciando deploy..." -ForegroundColor Yellow

# Configurar variáveis de ambiente
$API_URL = "https://gest-o-agenda-marcenaria-372428009665.southamerica-east1.run.app"

Write-Host "   Configurando variável VITE_API_URL..." -ForegroundColor Gray
vercel env add VITE_API_URL production

# Fazer deploy
Write-Host "   Fazendo deploy para produção..." -ForegroundColor Gray
vercel --prod

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   ✅ DEPLOY CONCLUÍDO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Yellow
Write-Host "1. Copie a URL que apareceu acima"
Write-Host "2. Teste acessando a URL"
Write-Host "3. Faça login com: admin@marcenaria.pro / 123"
Write-Host ""

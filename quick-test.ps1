# Teste Rápido do Sistema Completo
Write-Host "🧪 Validando Sistema FIVE Ambientes..." -ForegroundColor Cyan
Write-Host ""

$VERCEL = "https://gest-o-agenda-marcenaria.vercel.app"
$API = "https://gest-o-agenda-marcenaria-372428009665.southamerica-east1.run.app"

# Frontend
Write-Host "Frontend (Vercel)..." -NoNewline
try {
    $r = Invoke-WebRequest -Uri $VERCEL -UseBasicParsing -TimeoutSec 10
    if ($r.StatusCode -eq 200) {
        Write-Host " ✅ OK" -ForegroundColor Green
    }
}
catch {
    Write-Host " ❌ Erro" -ForegroundColor Red
}

# Backend
Write-Host "Backend (Cloud Run)..." -NoNewline
try {
    $r = Invoke-RestMethod -Uri "$API/api"
    if ($r.status -eq "API Online") {
        Write-Host " ✅ OK" -ForegroundColor Green
    }
}
catch {
    Write-Host " ❌ Erro" -ForegroundColor Red
}

# Endpoints
$tests = @("leads", "quotes", "projects", "events", "users")
foreach ($t in $tests) {
    Write-Host "API /$t..." -NoNewline
    try {
        Invoke-RestMethod -Uri "$API/api/$t" -ErrorAction Stop | Out-Null
        Write-Host " ✅ OK" -ForegroundColor Green
    }
    catch {
        Write-Host " ❌ Erro" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎉 Validação concluída!" -ForegroundColor Green
Write-Host ""
Write-Host "URLs:" -ForegroundColor Cyan
Write-Host "  Frontend: $VERCEL"
Write-Host "  Backend:  $API"
Write-Host ""
Write-Host "Login: admin@marcenaria.pro / 123" -ForegroundColor Yellow

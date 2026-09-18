# Script SIMPLIFICADO para forçar redeploy no Vercel
# Execute para forçar redeploy após mudanças no código

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   FORÇAR REDEPLOY NO VERCEL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Criando commit vazio para triggerar deploy..." -ForegroundColor Yellow

try {
    # Commit vazio para triggerar deploy
    git commit --allow-empty -m "trigger: Redeploy Vercel - Fix chunk size warnings"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Commit criado" -ForegroundColor Green
        
        # Push
        git push origin main
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Push enviado para GitHub" -ForegroundColor Green
            Write-Host ""
            Write-Host "========================================" -ForegroundColor Cyan
            Write-Host "   DEPLOY INICIADO!" -ForegroundColor Green
            Write-Host "========================================" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "Aguarde 2-3 minutos e teste:" -ForegroundColor Yellow
            Write-Host "https://gest-o-agenda-marcenaria.vercel.app" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "Acompanhe em:" -ForegroundColor Yellow
            Write-Host "https://vercel.com/dashboard" -ForegroundColor Cyan
        } else {
            Write-Host "❌ Erro ao fazer push" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Erro ao criar commit" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

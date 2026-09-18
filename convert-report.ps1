# Script para converter Markdown para PDF
# Requer: pandoc instalado (https://pandoc.org/installing.html)

Write-Host "Conversor de Relatório Financeiro" -ForegroundColor Cyan
Write-Host ""

$mdFile = "RELATORIO_FINANCEIRO.md"
$pdfFile = "RELATORIO_FINANCEIRO.pdf"
$docxFile = "RELATORIO_FINANCEIRO.docx"

# Verificar se pandoc está instalado
try {
    $null = pandoc --version
    Write-Host "✅ Pandoc encontrado" -ForegroundColor Green
}
catch {
    Write-Host "❌ Pandoc não encontrado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Para instalar:" -ForegroundColor Yellow
    Write-Host "1. Via Chocolatey: choco install pandoc"
    Write-Host "2. Via download: https://pandoc.org/installing.html"
    Write-Host "3. Via WinGet: winget install pandoc"
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "Convertendo para PDF..." -NoNewline

try {
    pandoc $mdFile -o $pdfFile --pdf-engine=wkhtmltopdf -V geometry:margin=1in
    Write-Host " ✅" -ForegroundColor Green
}
catch {
    Write-Host " ❌" -ForegroundColor Red
    Write-Host "Erro: $($_.Exception.Message)"
}

Write-Host "Convertendo para DOCX..." -NoNewline

try {
    pandoc $mdFile -o $docxFile
    Write-Host " ✅" -ForegroundColor Green
}
catch {
    Write-Host " ❌" -ForegroundColor Red
    Write-Host "Erro: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "Arquivos gerados:" -ForegroundColor Cyan
if (Test-Path $pdfFile) {
    Write-Host "  📄 $pdfFile" -ForegroundColor Green
}
if (Test-Path $docxFile) {
    Write-Host "  📄 $docxFile" -ForegroundColor Green
}

Write-Host ""
Write-Host "Concluído!" -ForegroundColor Green

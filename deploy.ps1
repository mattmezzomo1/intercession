# Deploy Script for Intercede Together
# Este script automatiza o processo de build e deploy para produção

Write-Host "🚀 Iniciando deploy para produção..." -ForegroundColor Green

# 1. Build do Frontend
Write-Host "`n📦 Fazendo build do frontend..." -ForegroundColor Yellow
npm run build:prod
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro no build do frontend!" -ForegroundColor Red
    exit 1
}

# 2. Build do Backend
Write-Host "`n📦 Fazendo build do backend..." -ForegroundColor Yellow
Set-Location backend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro no build do backend!" -ForegroundColor Red
    exit 1
}

# 3. Copiar arquivo de produção
Write-Host "`n📋 Configurando ambiente de produção..." -ForegroundColor Yellow
Write-Host "⚠️  ATENÇÃO: Configure suas chaves de API em .env.production antes de continuar!" -ForegroundColor Red
if (Test-Path ".env.production") {
    Copy-Item ".env.production" ".env" -Force
} else {
    Write-Host "❌ Arquivo .env.production não encontrado!" -ForegroundColor Red
    Write-Host "   Copie .env.production.example para .env.production e configure suas chaves de API" -ForegroundColor Yellow
    exit 1
}

# 4. Gerar cliente Prisma
Write-Host "`n🗄️ Gerando cliente Prisma..." -ForegroundColor Yellow
npm run db:generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao gerar cliente Prisma!" -ForegroundColor Red
    exit 1
}

Set-Location ..

Write-Host "`n✅ Build concluído com sucesso!" -ForegroundColor Green
Write-Host "`n📋 Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Faça upload da pasta 'dist' (frontend) para seu servidor web" -ForegroundColor White
Write-Host "2. Faça upload da pasta 'backend/dist' e 'backend/node_modules' para seu servidor Node.js" -ForegroundColor White
Write-Host "3. Configure as variáveis de ambiente no servidor usando backend/.env.production" -ForegroundColor White
Write-Host "4. Execute 'npm start' no servidor para iniciar o backend" -ForegroundColor White

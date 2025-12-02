# Script para subir a GitHub
# Uso: .\push-to-github.ps1 <url-del-repositorio>

param(
    [Parameter(Mandatory=$true)]
    [string]$RepoUrl
)

Write-Host "🚀 Preparando para subir a GitHub..." -ForegroundColor Cyan

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: No se encontró package.json. Asegúrate de estar en el directorio del proyecto." -ForegroundColor Red
    exit 1
}

Write-Host "✓ Directorio correcto" -ForegroundColor Green

# Verificar que hay un repositorio git
if (-not (Test-Path ".git")) {
    Write-Host "❌ Error: No hay repositorio Git. Ejecuta 'git init' primero." -ForegroundColor Red
    exit 1
}

Write-Host "✓ Repositorio Git encontrado" -ForegroundColor Green

# Agregar remote
Write-Host "📡 Agregando remote origin..." -ForegroundColor Cyan
git remote remove origin 2>$null
git remote add origin $RepoUrl

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al agregar remote" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Remote agregado" -ForegroundColor Green

# Verificar que hay cambios commiteados
$commits = git log --oneline 2>$null
if (-not $commits) {
    Write-Host "⚠️  No hay commits. Haciendo commit inicial..." -ForegroundColor Yellow
    git add .
    git commit -m "Initial commit: Workana Tracker"
}

Write-Host "✓ Commits encontrados" -ForegroundColor Green

# Push a GitHub
Write-Host "⬆️  Subiendo a GitHub..." -ForegroundColor Cyan
git push -u origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al hacer push. Verifica que:" -ForegroundColor Red
    Write-Host "  1. La URL del repositorio es correcta" -ForegroundColor Yellow
    Write-Host "  2. Tienes permisos para subir al repositorio" -ForegroundColor Yellow
    Write-Host "  3. Has autenticado con GitHub (token o SSH)" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "✅ ¡Proyecto subido exitosamente a GitHub!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos pasos para deployar en Vercel:" -ForegroundColor Cyan
Write-Host "  1. Ve a https://vercel.com" -ForegroundColor White
Write-Host "  2. Haz clic en 'New Project'" -ForegroundColor White
Write-Host "  3. Importa tu repositorio de GitHub" -ForegroundColor White
Write-Host "  4. Vercel detectará automáticamente Next.js" -ForegroundColor White
Write-Host "  5. Haz clic en 'Deploy'" -ForegroundColor White
Write-Host ""
Write-Host "🎉 ¡Listo!" -ForegroundColor Green

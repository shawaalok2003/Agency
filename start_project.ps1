Write-Host "Starting AgencyOS..." -ForegroundColor Cyan
Write-Host "--------------------------------"

# Check if using Cloud Database
$envPath = Join-Path $PSScriptRoot "server\.env"
$isCloudDb = $false

if (Test-Path $envPath) {
    $envContent = Get-Content $envPath -Raw
    if ($envContent -match "neon\.tech" -or $envContent -match "aws\.neon\.tech" -or $envContent -match "pooler") {
        $isCloudDb = $true
    }
}

if ($isCloudDb) {
    Write-Host "Cloud Database detected (Neon PostgreSQL). Skipping local Docker." -ForegroundColor Green
} else {
    Write-Host "Checking local Docker..."
    try {
        $dockerCheck = docker ps 2>&1
        if ($LASTEXITCODE -eq 0) {
            docker compose up -d
        } else {
            Write-Host "Docker is not running. Using fallback/configured database." -ForegroundColor Yellow
        }
    } catch {
        Write-Host "Docker not available. Skipping local container startup." -ForegroundColor Yellow
    }
}

# Start Server
Write-Host "Starting AgencyOS Server (Fastify API on :4000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; npm run dev -w server"

# Start Web (Next.js)
Write-Host "Starting AgencyOS Web App (Next.js on :3000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; npm run dev -w web"

Write-Host "--------------------------------"
Write-Host "All AgencyOS services launched successfully!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "Backend API: http://localhost:4000" -ForegroundColor White

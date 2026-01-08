Write-Host "Starting Agency Auto Project..."
Write-Host "--------------------------------"

# Start Docker
Write-Host "Starting Database..."
try {
    docker-compose up -d
} catch {
    Write-Error "Failed to start Docker containers. Please ensure Docker Desktop is running."
    Read-Host -Prompt "Press Enter to continue anyway (Server might fail without DB)..."
}

# Start Server
Write-Host "Starting Server..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd server; if (!(Test-Path node_modules)) { npm install }; npm run dev"


# Start Web (Next.js)
Write-Host "Starting Web App..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd web; if (!(Test-Path node_modules)) { npm install }; npm run dev"

Write-Host "All services launched in separate windows."
Read-Host -Prompt "Press Enter to exit this launcher..."

# Recipe Directory - Development Startup Script
# This script starts both backend and frontend servers

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Recipe Directory - Starting Dev Mode" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if MongoDB is running
Write-Host "Checking MongoDB..." -ForegroundColor Yellow
$mongoProcess = Get-Process mongod -ErrorAction SilentlyContinue
if ($mongoProcess) {
    Write-Host "✓ MongoDB is running" -ForegroundColor Green
} else {
    Write-Host "⚠ MongoDB might not be running" -ForegroundColor Yellow
    Write-Host "  Starting MongoDB..." -ForegroundColor Yellow
    try {
        Start-Process "mongod" -WindowStyle Hidden
        Start-Sleep -Seconds 2
        Write-Host "✓ MongoDB started" -ForegroundColor Green
    } catch {
        Write-Host "⚠ Could not start MongoDB automatically" -ForegroundColor Yellow
        Write-Host "  Please start MongoDB manually" -ForegroundColor Yellow
    }
}

# Check if dependencies are installed
Write-Host ""
Write-Host "Checking dependencies..." -ForegroundColor Yellow

if (-Not (Test-Path "node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    npm install
}

if (-Not (Test-Path "client/node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    Set-Location client
    npm install
    Set-Location ..
}

Write-Host "✓ Dependencies are ready" -ForegroundColor Green

# Start the servers
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting Servers..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Backend will run on: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend will run on: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop both servers" -ForegroundColor Yellow
Write-Host ""

# Start backend in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; Write-Host 'Backend Server' -ForegroundColor Green; npm run dev"

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start frontend in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\client'; Write-Host 'Frontend Server' -ForegroundColor Green; npm start"

Write-Host "✓ Servers started successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "The application will open automatically in your browser." -ForegroundColor Cyan
Write-Host "If it doesn't, visit: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "To stop the servers, close the PowerShell windows." -ForegroundColor Yellow


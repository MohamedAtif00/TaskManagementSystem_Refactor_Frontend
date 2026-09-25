# Starts backend API (:61173) and Angular frontend (:4200) against a seeded SQL Server database.
# Usage:
#   ./scripts/dev-stack.ps1                 # start servers only
#   ./scripts/dev-stack.ps1 -Seed           # migrate + seed first, then start
#   ./scripts/dev-stack.ps1 -Seed -SkipHeavyLoad

param(
    [string]$ConnectionString = "Server=localhost;Database=TaskManagementSystem;Trusted_Connection=True;TrustServerCertificate=True",
    [switch]$Seed,
    [switch]$SkipHeavyLoad
)

$ErrorActionPreference = "Stop"
$frontendRoot = Split-Path -Parent $PSScriptRoot
$backendRoot = Join-Path (Split-Path -Parent $frontendRoot) "TaskManagementSystem_Refactor\TaskManagementSystem"
$apiProject = Join-Path $backendRoot "src\Api\TaskManagementSystem.Api\TaskManagementSystem.Api.csproj"
$seedScript = Join-Path $frontendRoot "scripts/seed-stack.ps1"

function Test-PortInUse([int]$Port) {
    return [bool](Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue)
}

if (-not (Test-Path $apiProject)) {
    throw "API project not found at: $apiProject"
}

if ($Seed) {
    $seedArgs = @("-ConnectionString", $ConnectionString)
    if ($SkipHeavyLoad) { $seedArgs += "-SkipHeavyLoad" }
    & $seedScript @seedArgs
}

if (Test-PortInUse 61173) {
    Write-Warning "Port 61173 is already in use. Backend may already be running."
} else {
    Write-Host "Starting backend on http://localhost:61173 ..."
    Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-Command",
        "cd '$backendRoot'; dotnet run --project '$apiProject' --urls 'http://localhost:61173'"
    ) | Out-Null
}

Start-Sleep -Seconds 3

if (Test-PortInUse 4200) {
    Write-Warning "Port 4200 is already in use. Frontend may already be running."
} else {
    Write-Host "Starting frontend on http://127.0.0.1:4200 ..."
    Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-Command",
        "cd '$frontendRoot'; npm start -- --host 127.0.0.1 --port 4200"
    ) | Out-Null
}

if ($Seed) {
    Write-Host "`nStack starting. Open http://127.0.0.1:4200 and sign in with TST001." -ForegroundColor Green
} else {
    Write-Host "`nStack starting. Open http://127.0.0.1:4200 and sign in with a legacy user Code from [identity].[Users]." -ForegroundColor Green
}

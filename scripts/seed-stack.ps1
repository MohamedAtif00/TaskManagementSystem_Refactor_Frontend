# Runs DbUp migrations + base integration seed + heavy-load seed for local dev / integration tests.
# Usage:
#   ./scripts/seed-stack.ps1
#   ./scripts/seed-stack.ps1 -ConnectionString "Server=(localdb)\MSSQLLocalDB;Database=TaskManagementSystem;Trusted_Connection=True;TrustServerCertificate=True"
#   ./scripts/seed-stack.ps1 -SkipHeavyLoad
#   ./scripts/seed-stack.ps1 -ClearHeavyLoad

param(
    [string]$ConnectionString = "Server=localhost;Database=TaskManagementSystem;Trusted_Connection=True;TrustServerCertificate=True",
    [switch]$SkipHeavyLoad,
    [switch]$ClearHeavyLoad,
    [switch]$WhatIf
)

$ErrorActionPreference = "Stop"
$frontendRoot = Split-Path -Parent $PSScriptRoot
$backendRoot = Join-Path (Split-Path -Parent $frontendRoot) "TaskManagementSystem_Refactor\TaskManagementSystem"
$migratorProject = Join-Path $backendRoot "src\Database\DatabaseMigrator\DatabaseMigrator.csproj"
$migrationsPath = Join-Path $backendRoot "src/Database/TaskManagementSystem.Database/Scripts/Migrations"
$seedScript = Join-Path $backendRoot "scripts/seed-database.ps1"
$heavyLoadScript = Join-Path $backendRoot "scripts/seed-heavy-load.ps1"

if (-not (Test-Path $backendRoot)) {
    throw "Backend repo not found at: $backendRoot"
}

Write-Host "=== TMS seed stack ===" -ForegroundColor Cyan
Write-Host "Database: $ConnectionString"

if ($WhatIf) {
    Write-Host "[WhatIf] Would run migrations, base seed, and heavy-load seed."
    exit 0
}

Write-Host "`n[1/3] Running migrations..."
dotnet run --project $migratorProject -- $ConnectionString $migrationsPath

Write-Host "`n[2/3] Running base integration seed (TST001)..."
& $seedScript -ConnectionString $ConnectionString

if ($ClearHeavyLoad) {
    Write-Host "`nClearing heavy-load seed..."
    & $heavyLoadScript -ConnectionString $ConnectionString -Clear
}

if (-not $SkipHeavyLoad) {
    Write-Host "`n[3/3] Running heavy-load seed..."
    & $heavyLoadScript -ConnectionString $ConnectionString
} else {
    Write-Host "`n[3/3] Skipped heavy-load seed (-SkipHeavyLoad)."
}

Write-Host "`nDone. Login with HR code: TST001" -ForegroundColor Green

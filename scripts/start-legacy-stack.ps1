# Starts backend + frontend against TaskManagementSystem with legacy imported data.
# Runs schema migrations only — no demo seed scripts.
# Usage:
#   ./scripts/start-legacy-stack.ps1
#   ./scripts/start-legacy-stack.ps1 -SkipMigrate

param(
    [string]$ConnectionString = "Server=localhost;Database=TaskManagementSystem;Trusted_Connection=True;TrustServerCertificate=True",
    [switch]$SkipMigrate
)

$ErrorActionPreference = "Stop"
$frontendRoot = Split-Path -Parent $PSScriptRoot
$backendRoot = Join-Path (Split-Path -Parent $frontendRoot) "TaskManagementSystem_Refactor\TaskManagementSystem"
$migratorProject = Join-Path $backendRoot "src\Database\DatabaseMigrator\DatabaseMigrator.csproj"
$migrationsPath = Join-Path $backendRoot "src/Database/TaskManagementSystem.Database/Scripts/Migrations"
$devStackScript = Join-Path $frontendRoot "scripts/dev-stack.ps1"

function Get-LegacyLoginHints([string]$ConnectionString) {
    try {
        $builder = New-Object System.Data.SqlClient.SqlConnectionStringBuilder $ConnectionString
        $dbName = $builder.InitialCatalog
        $server = if ($builder.DataSource) { $builder.DataSource } else { "localhost" }
        $query = "SET NOCOUNT ON; SELECT TOP 5 [Code], [Name] FROM [$dbName].[identity].[Users] WHERE [Archived] = 0 ORDER BY [Id];"
        $rows = sqlcmd -S $server -E -C -Q $query -h -1 -W 2>$null
        if ($LASTEXITCODE -ne 0 -or -not $rows) {
            return @("Use any non-archived 6-character Code from [identity].[Users].")
        }

        return $rows |
            Where-Object { $_.Trim() -ne "" } |
            ForEach-Object {
                $parts = $_ -split '\s+', 2
                if ($parts.Count -ge 2) {
                    "$($parts[0]) ($($parts[1]))"
                } else {
                    $parts[0]
                }
            }
    }
    catch {
        return @("Use any non-archived 6-character Code from [identity].[Users].")
    }
}

Write-Host "=== TMS legacy stack (no seed) ===" -ForegroundColor Cyan
Write-Host "Database: $ConnectionString"

if (-not $SkipMigrate) {
    Write-Host "`nRunning schema migrations only..."
    dotnet run --project $migratorProject -- $ConnectionString $migrationsPath
    if ($LASTEXITCODE -ne 0) {
        throw "Database migration failed."
    }
} else {
    Write-Host "`nSkipped migrations (-SkipMigrate)."
}

Write-Host "`nStarting API and frontend (no seed)..."
& $devStackScript -ConnectionString $ConnectionString

$hints = Get-LegacyLoginHints $ConnectionString
Write-Host "`nLegacy login codes (examples):" -ForegroundColor Green
foreach ($hint in $hints) {
    Write-Host "  $hint"
}

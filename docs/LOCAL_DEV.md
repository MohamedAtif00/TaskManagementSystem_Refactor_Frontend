# Local development — full stack

## Prerequisites

- Node.js 20+ and npm
- .NET 10 SDK
- SQL Server or LocalDB
- Playwright browsers: `npx playwright install chromium`

The frontend lives in `D:\Full-Stack\frontend_refactor`. The API lives in `D:\Full-Stack\TaskManagementSystem_Refactor\TaskManagementSystem`.

`src/environments/environment.ts` defaults to `useMock: false` so `ng serve` talks to the API through `proxy.conf.json`.

`proxy.conf.json` also forwards `/realtime` with websockets for live ticket and notification updates.

Sync the backend OpenAPI snapshot into the frontend with `npm run openapi:sync`. Typed DTOs live in `src/app/core/api/tms-contracts.ts`.

## One-time database setup

From the frontend repo:

```powershell
cd D:\Full-Stack\frontend_refactor
.\scripts\seed-stack.ps1
```

This runs, in order:

1. DbUp migrations (`TaskManagementSystem` database)
2. Base integration seed — user **TST001** (Owner)
3. Heavy-load seed — curriculum tree, ~2k tickets, teams, sections, sprints

### LocalDB connection string

```powershell
.\scripts\seed-stack.ps1 -ConnectionString "Server=(localdb)\MSSQLLocalDB;Database=TaskManagementSystem;Trusted_Connection=True;TrustServerCertificate=True"
```

### Reset heavy-load data

```powershell
.\scripts\seed-stack.ps1 -ClearHeavyLoad
.\scripts\seed-stack.ps1
```

## Start frontend + backend

```powershell
# Servers only (DB already seeded)
.\scripts\dev-stack.ps1

# Seed first, then start
.\scripts\dev-stack.ps1 -Seed
```

Or manually:

```powershell
# Terminal 1 — API
cd D:\Full-Stack\TaskManagementSystem_Refactor\TaskManagementSystem
dotnet run --project src\Api\TaskManagementSystem.Api --urls http://localhost:61173

# Terminal 2 — Angular (proxies API via proxy.conf.json)
cd D:\Full-Stack\frontend_refactor
npm start
```

Open **http://127.0.0.1:4200** and sign in with **TST001**.

Mock mode (`useMock: true` in `environment.ts`) is only for offline UI work. Playwright mock tests use `--configuration e2e` and `e2e/fixtures/api-mocks.ts`.

## Testing

| Command | Description |
|---------|-------------|
| `npm run e2e` | Mock Playwright tests (no backend required) |
| `npm run e2e:integration` | Integration tests against real API + seeded DB |
| `npm run e2e:all` | Both suites |
| `npm run stack:seed` | Run migrate + seeds only |
| `npm run stack:start` | Start backend + frontend |

Integration tests require the database to be seeded and will start backend + frontend automatically.

## esbuild on Windows

If `ng serve` fails with "The service was stopped", reinstall the esbuild binary:

```powershell
npm install @esbuild/win32-x64@0.28.2 --save-dev
node node_modules/esbuild/install.js
```

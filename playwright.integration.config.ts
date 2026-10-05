import { defineConfig, devices } from '@playwright/test';
import path from 'path';

const backendRoot = path.resolve(__dirname, '../TaskManagementSystem_Refactor/TaskManagementSystem');
const apiProject = path.join(
  backendRoot,
  'src/Api/TaskManagementSystem.Api/TaskManagementSystem.Api.csproj',
);
const seedConnectionString =
  process.env.TMS_CONNECTION_STRING ??
  'Server=localhost;Database=TaskManagementSystem;Trusted_Connection=True;TrustServerCertificate=True';

export default defineConfig({
  testDir: './e2e/integration',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 90_000,
  globalSetup: './e2e/integration/global-setup.ts',
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report/integration' }]],
  use: {
    baseURL: 'http://127.0.0.1:4200',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: `dotnet run --project "${apiProject}" --urls http://localhost:5100`,
      url: 'http://localhost:5100/openapi/v1.json',
      reuseExistingServer: !process.env.CI,
      timeout: 300_000,
      cwd: backendRoot,
      env: {
        ConnectionStrings__DefaultConnection: seedConnectionString,
      },
    },
    {
      command: 'npx ng serve --host 127.0.0.1 --port 4200',
      url: 'http://127.0.0.1:4200',
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
  ],
});

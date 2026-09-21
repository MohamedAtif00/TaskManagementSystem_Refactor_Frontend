const API_BASE = process.env.TMS_API_URL ?? 'http://localhost:61173';

async function globalSetup(): Promise<void> {
  let openapiOk = false;
  for (let attempt = 0; attempt < 30; attempt++) {
    try {
      const response = await fetch(`${API_BASE}/openapi/v1.json`);
      if (response.ok) {
        openapiOk = true;
        break;
      }
    } catch {
      // API still starting
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  if (!openapiOk) {
    throw new Error(
      `Backend API is not reachable at ${API_BASE}. Start the stack with .\\scripts\\dev-stack.ps1 or run npm run e2e:integration after seeding.`,
    );
  }

  const loginResponse = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: 'TST001' }),
  });

  if (!loginResponse.ok) {
    throw new Error(
      'TST001 login failed. Run .\\scripts\\seed-stack.ps1 to migrate and seed the database (including TST001 Owner).',
    );
  }
}

export default globalSetup;

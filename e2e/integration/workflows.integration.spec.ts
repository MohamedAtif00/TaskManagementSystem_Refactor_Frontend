import { test, expect, loginAsTST001 } from './fixtures/auth-real';

test.describe('Workflows (integration)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTST001(page);
  });

  test('schemas list shows seeded schemas', async ({ page }) => {
    await page.goto('/workflows/schemas');
    await expect(page.getByRole('heading', { name: 'Schemas', exact: true })).toBeVisible();
    await expect(page.getByText(/SEED_Schema_/)).toBeVisible();
  });

  test('task bank list loads', async ({ page }) => {
    await page.goto('/workflows/task-bank');
    await expect(page.getByRole('heading', { name: 'Task bank', exact: true })).toBeVisible();
    await expect(page.locator('tbody tr').first()).toBeVisible();
  });
});

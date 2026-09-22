import { test, expect, loginAsTST001 } from './fixtures/auth-real';

test.describe('Curriculum (integration)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTST001(page);
    await page.goto('/projects/curriculum');
  });

  test('shows seeded year nodes', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Curriculum', exact: true })).toBeVisible();
    await expect(page.getByText(/SEED_Year_/)).toBeVisible();
  });

  test('expands year to reveal project tree', async ({ page }) => {
    await page.getByRole('button', { name: /^Expand / }).first().click();
    await expect(page.getByText(/SEED_Project_/)).toBeVisible();
  });
});

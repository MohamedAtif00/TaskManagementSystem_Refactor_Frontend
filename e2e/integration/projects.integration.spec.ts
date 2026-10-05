import { test, expect, loginAsTST001, clickAppButton } from './fixtures/auth-real';

test.describe('Projects (integration)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTST001(page);
    await page.goto('/projects');
  });

  test('lists seeded projects', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Projects', exact: true })).toBeVisible();
    await expect(page.getByText(/SEED_Project_Y/).first()).toBeVisible();
  });

  test('search filters project list', async ({ page }) => {
    await page.getByPlaceholder('Search projects').fill('SEED_Project_Y1');
    await expect(page.getByRole('cell', { name: 'SEED_Project_Y1_P1' })).toBeVisible();
    await expect(page.getByRole('cell', { name: /SEED_Project_Y2/ })).toHaveCount(0);
  });

  test('create project modal opens', async ({ page }) => {
    await clickAppButton(page, 'Add project');
    await expect(page.getByRole('heading', { name: /Create project/i })).toBeVisible();
  });
});

import { test, expect, loginAsTST001 } from './fixtures/auth-real';

test.describe('Resources (integration)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTST001(page);
  });

  test('users list includes TST001', async ({ page }) => {
    await page.goto('/resources/users');
    await expect(page.getByRole('heading', { name: 'Users', exact: true })).toBeVisible();
    await expect(page.getByText('TST001')).toBeVisible();
  });

  test('roles list loads', async ({ page }) => {
    await page.goto('/resources/roles');
    await expect(page.getByRole('heading', { name: 'Roles', exact: true })).toBeVisible();
    await expect(page.getByText('Owner')).toBeVisible();
  });

  test('sections list shows seeded sections', async ({ page }) => {
    await page.goto('/resources/sections');
    await expect(page.getByRole('heading', { name: 'Sections', exact: true })).toBeVisible();
    await expect(page.getByText(/SEED_Section_/)).toBeVisible();
  });
});

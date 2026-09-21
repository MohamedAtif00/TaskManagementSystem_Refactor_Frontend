import { test, expect, loginAsTST001 } from './fixtures/auth-real';

test.describe('Dashboard (integration)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTST001(page);
  });

  test('shows project manager stat cards', async ({ page }) => {
    await expect(page.locator('app-stat-card').filter({ hasText: 'Users' })).toBeVisible();
    await expect(page.locator('app-stat-card').filter({ hasText: 'Projects' })).toBeVisible();
    await expect(page.locator('app-stat-card').filter({ hasText: 'Active Tasks' })).toBeVisible();
  });

  test('active tasks count is greater than zero', async ({ page }) => {
    const card = page.locator('app-stat-card').filter({ hasText: 'Active Tasks' });
    await expect(card).toBeVisible();
    await expect(card).not.toContainText(/^0$/);
  });

  test('shows learning objectives chart', async ({ page }) => {
    await expect(page.getByText('Learning objectives')).toBeVisible();
  });
});

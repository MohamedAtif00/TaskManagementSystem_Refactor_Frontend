import { test, expect, loginAsOwner, clickAppButton } from './fixtures/auth';

test.describe('Workflows / Schemas', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsOwner(page);
    await page.goto('/workflows/schemas');
  });

  test('owner can view schema list', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Schemas', exact: true })).toBeVisible();
    await expect(page.getByText('Default')).toBeVisible();
    await expect(page.getByText('Review flow')).toBeVisible();
  });

  test('shows add schema button', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Add schema' })).toBeVisible();
  });

  test('navigates to task bank from sidebar', async ({ page }) => {
    const sidebar = page.locator('app-sidebar');
    await sidebar.getByText('Workflows', { exact: true }).click();
    await sidebar.getByRole('link', { name: 'Task bank' }).click();
    await expect(page).toHaveURL(/\/workflows\/task-bank/);
    await expect(page.getByRole('heading', { name: 'Task bank', exact: true })).toBeVisible();
  });
});

import { test, expect, loginAsOwner } from './fixtures/auth';

test.describe('Error pages', () => {
  test('unknown route shows 404 and home button returns to dashboard', async ({ page }) => {
    await loginAsOwner(page);
    await page.goto('/does-not-exist');
    await expect(page.getByRole('heading', { name: 'Booo!' })).toBeVisible();
    await page.getByRole('button', { name: 'Home Page' }).click();
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();
  });
});

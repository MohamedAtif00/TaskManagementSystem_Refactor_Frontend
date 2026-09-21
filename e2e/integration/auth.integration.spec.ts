import { test, expect, loginAsTST001 } from './fixtures/auth-real';

test.describe('Authentication (integration)', () => {
  test('TST001 login reaches dashboard', async ({ page }) => {
    await loginAsTST001(page);
    await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();
  });

  test('rejects invalid employee code', async ({ page }) => {
    await page.goto('/auth/sign-in');
    await page.locator('#code').fill('NOTREAL');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByText('Invalid employee code')).toBeVisible();
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });
});

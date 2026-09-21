import { test, expect, login, loginAsOwner, logout } from './fixtures/auth';

test.describe('Authentication', () => {
  test('shows validation when employee code is empty', async ({ page }) => {
    await page.goto('/auth/sign-in', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByText('Required field')).toBeVisible();
  });

  test('shows toast for invalid employee code', async ({ page }) => {
    await page.goto('/auth/sign-in');
    await page.locator('#code').fill('BAD001');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByText('Invalid employee code')).toBeVisible();
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });

  test('logs in with demo code and lands on dashboard', async ({ page }) => {
    await loginAsOwner(page);
    await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();
    await expect(page.getByText('Welcome back, Omar Owner')).toBeVisible();
  });

  test('project manager can sign in', async ({ page }) => {
    await login(page, 'PM001');
    await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();
    await expect(page.getByText('Welcome back, Paula Manager')).toBeVisible();
  });

  test('logs out and returns to sign-in', async ({ page }) => {
    await loginAsOwner(page);
    await logout(page);
    await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible();
  });

  test('redirects unauthenticated users to sign-in', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });

  test('redirects authenticated users away from sign-in', async ({ page }) => {
    await loginAsOwner(page);
    await page.goto('/auth/sign-in');
    await expect(page).toHaveURL(/\/dashboard/);
  });
});

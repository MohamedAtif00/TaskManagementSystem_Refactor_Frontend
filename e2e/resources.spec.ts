import { test, expect, loginAsOwner, clickAppButton } from './fixtures/auth';

test.describe('Resources / Users', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsOwner(page);
    await page.goto('/resources/users');
  });

  test('owner can list users', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Users', exact: true })).toBeVisible();
    await expect(page.getByText('Mona Member')).toBeVisible();
    await expect(page.getByText('Paula Manager')).toBeVisible();
  });

  test('owner can open add user modal', async ({ page }) => {
    await clickAppButton(page, 'Add user');
    await expect(page.getByRole('heading', { name: /Create user/i })).toBeVisible();
    await clickAppButton(page, 'Cancel');
  });

  test('shows role and team columns', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: 'Role' })).toBeVisible();
    await expect(page.getByText('Math Team')).toBeVisible();
  });
});

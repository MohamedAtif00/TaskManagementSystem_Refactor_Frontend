import { test, expect, loginAsOwner, clickAppButton } from './fixtures/auth';

test.describe('Roles', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsOwner(page);
    await page.goto('/resources/roles');
  });

  test('lists roles', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Roles', exact: true })).toBeVisible();
    await expect(page.getByText('Project Manager')).toBeVisible();
    await expect(page.getByText('Owner')).toBeVisible();
  });

  test('opens create role modal', async ({ page }) => {
    await clickAppButton(page, 'Add role');
    await expect(page.getByRole('heading', { name: /Create role/i })).toBeVisible();
    await clickAppButton(page, 'Cancel');
  });

  test('shows permissions column', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: 'Permissions' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'System' })).toBeVisible();
  });
});

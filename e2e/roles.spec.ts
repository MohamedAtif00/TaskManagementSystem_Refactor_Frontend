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
    await expect(page.getByText('Copy from role')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'HR Forgotclock' })).toBeVisible();
    await clickAppButton(page, 'Cancel');
  });

  test('checking full access marks module CRUD', async ({ page }) => {
    await clickAppButton(page, 'Add role');
    await page.getByRole('checkbox', { name: 'HR Forgotclock full access' }).check();
    await expect(page.getByRole('checkbox', { name: 'HR Forgotclock Read' })).toBeChecked();
    await expect(page.getByRole('checkbox', { name: 'HR Forgotclock Create' })).toBeChecked();
    await expect(page.getByRole('checkbox', { name: 'HR Forgotclock Update' })).toBeChecked();
    await expect(page.getByRole('checkbox', { name: 'HR Forgotclock Delete' })).toBeChecked();
    await page.getByRole('checkbox', { name: 'HR Forgotclock full access' }).uncheck();
    await expect(page.getByRole('checkbox', { name: 'HR Forgotclock Read' })).not.toBeChecked();
    await expect(page.getByRole('checkbox', { name: 'HR Forgotclock Create' })).not.toBeChecked();
    await expect(page.getByRole('checkbox', { name: 'HR Forgotclock Update' })).not.toBeChecked();
    await expect(page.getByRole('checkbox', { name: 'HR Forgotclock Delete' })).not.toBeChecked();
  });

  test('shows permissions column', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: 'Permissions' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'System' })).toBeVisible();
  });
});

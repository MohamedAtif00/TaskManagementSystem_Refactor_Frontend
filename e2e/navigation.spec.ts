import { test, expect, loginAsOwner, loginAsMember, loginAsProjectManager, loginAsTeamLeader } from './fixtures/auth';

test.describe('Navigation', () => {
  test('owner sees admin navigation links', async ({ page }) => {
    await loginAsOwner(page);
    const sidebar = page.locator('app-sidebar');
    await expect(sidebar.getByText('Projects', { exact: true })).toBeVisible();
    await expect(sidebar.getByText('Resources', { exact: true })).toBeVisible();
    await expect(sidebar.getByText('Workflows', { exact: true })).toBeVisible();
    await expect(sidebar.getByText('Sprint management', { exact: true })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: 'Users' })).toBeVisible();
  });

  test('project manager sees projects and resources', async ({ page }) => {
    await loginAsProjectManager(page);
    const sidebar = page.locator('app-sidebar');
    await expect(sidebar.getByText('Projects', { exact: true })).toBeVisible();
    await expect(sidebar.getByText('Resources', { exact: true })).toBeVisible();
  });

  test('team leader sees kanban and sprints', async ({ page }) => {
    await loginAsTeamLeader(page);
    const sidebar = page.locator('app-sidebar');
    await expect(sidebar.getByText('Kanban', { exact: true })).toBeVisible();
    await expect(sidebar.getByText('Sprints', { exact: true })).toBeVisible();
    await expect(sidebar.getByText('Sprint management', { exact: true })).toHaveCount(0);
  });

  test('sprint management does not highlight work sprints', async ({ page }) => {
    await loginAsOwner(page);
    await page.goto('/sprints/manage');
    const sidebar = page.locator('app-sidebar');
    await expect(sidebar.getByText('Sprint management', { exact: true })).toHaveAttribute('aria-current', 'page');
    await expect(sidebar.getByText('Sprints', { exact: true })).not.toHaveAttribute('aria-current', 'page');
  });

  test('member sees My Leaves instead of Projects', async ({ page }) => {
    await loginAsMember(page);
    const sidebar = page.locator('app-sidebar');
    await expect(sidebar.getByText('My Leaves', { exact: true })).toBeVisible();
    await expect(sidebar.getByText('Projects', { exact: true })).toHaveCount(0);
    await expect(sidebar.getByText('Resources', { exact: true })).toHaveCount(0);
  });

  test('member is redirected from protected admin route', async ({ page }) => {
    await loginAsMember(page);
    await page.goto('/projects');
    await expect(page).toHaveURL(/\/dashboard/);
  });
});

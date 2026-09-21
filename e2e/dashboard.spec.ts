import { test, expect, loginAsOwner, loginAsMember, loginAsTeamLeader, loginAsSectionHead } from './fixtures/auth';

test.describe('Dashboard', () => {
  test('owner sees project manager widgets', async ({ page }) => {
    await loginAsOwner(page);
    await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();
    await expect(page.locator('app-stat-card').filter({ hasText: 'Users' })).toBeVisible();
    await expect(page.locator('app-stat-card').filter({ hasText: 'Projects' })).toBeVisible();
    await expect(page.locator('app-stat-card').filter({ hasText: 'Schemas' })).toBeVisible();
    await expect(page.locator('app-stat-card').filter({ hasText: 'Active Tasks' })).toBeVisible();
  });

  test('owner dashboard shows non-zero active tasks', async ({ page }) => {
    await loginAsOwner(page);
    const card = page.locator('app-stat-card').filter({ hasText: 'Active Tasks' });
    await expect(card).toBeVisible();
    await expect(card).not.toContainText('0');
  });

  test('owner dashboard shows learning objectives chart', async ({ page }) => {
    await loginAsOwner(page);
    await expect(page.getByText('Learning objectives')).toBeVisible();
    await expect(page.getByText('Users by group')).toBeVisible();
  });

  test('team leader sees team dashboard', async ({ page }) => {
    await loginAsTeamLeader(page);
    await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();
    await expect(page.locator('app-stat-card').filter({ hasText: 'Members' })).toBeVisible();
    await expect(page.getByText('Project load')).toBeVisible();
    await expect(page.getByText('Tasks per member')).toBeVisible();
  });

  test('section head sees section dashboard', async ({ page }) => {
    await loginAsSectionHead(page);
    await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();
    await expect(page.locator('app-stat-card').filter({ hasText: 'Teams' })).toBeVisible();
    await expect(page.getByText('Teams in section')).toBeVisible();
  });

  test('member sees personal task stats', async ({ page }) => {
    await loginAsMember(page);
    await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();
    await expect(page.getByText('Assigned', { exact: true })).toBeVisible();
    await expect(page.getByText('In progress', { exact: true })).toBeVisible();
    await expect(page.getByText('Done', { exact: true })).toBeVisible();
    await expect(page.getByText('Overdue', { exact: true })).toBeVisible();
  });
});

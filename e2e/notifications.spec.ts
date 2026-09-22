import { test, expect, loginAsOwner } from './fixtures/auth';

test.describe('Notifications bell and inbox', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await loginAsOwner(page);
  });

  test('bell opens popover with unread items and inbox is not in navbar menu', async ({ page }) => {
    await page.getByRole('button', { name: 'Notifications' }).click();
    await expect(page.getByText('Ticket assigned')).toBeVisible();
    await expect(page.getByText('Leave approved')).toBeVisible();
    await expect(page.getByRole('button', { name: 'View all notifications' })).toBeVisible();
    await expect(page.locator('app-navbar-menu')).not.toContainText('Inbox');
  });

  test('mark read in popover updates badge count', async ({ page }) => {
    const badge = page.locator('app-notification-bell .bg-destructive');
    await expect(badge).toHaveText('2');
    await page.getByRole('button', { name: 'Notifications' }).click();
    const markRead = page.locator('app-notification-bell').getByRole('button', { name: 'Mark read' }).first();
    await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes('/notifications/') && response.request().method() === 'PATCH' && response.ok(),
      ),
      markRead.click(),
    ]);
    await expect(badge).toHaveText('1');
  });

  test('view all navigates to inbox page', async ({ page }) => {
    await page.getByRole('button', { name: 'Notifications' }).click();
    await page.getByRole('button', { name: 'View all notifications' }).click();
    await expect(page).toHaveURL(/\/notifications/);
    await expect(page.getByRole('heading', { name: 'Inbox' })).toBeVisible();
    await expect(page.getByText('Ticket assigned')).toBeVisible();
  });

  test('sidebar inbox shows unread badge and full list', async ({ page }) => {
    const sidebar = page.locator('app-sidebar');
    const inboxItem = sidebar.getByText(/Inbox/);
    await expect(inboxItem).toBeVisible();
    await inboxItem.click();
    await expect(page).toHaveURL(/\/notifications/);
    await expect(page.getByRole('heading', { name: 'Inbox' })).toBeVisible();
    await expect(page.getByText('Sprint started')).toBeVisible();
  });
});

import { test, expect, loginAsOwner, loginAsMember, clickAppButton } from './fixtures/auth';

test.describe('Leaves', () => {
  test('member sees balances and can open new request modal', async ({ page }) => {
    await loginAsMember(page);
    await page.goto('/leaves/mine');
    await expect(page.getByRole('heading', { name: 'My time off' })).toBeVisible();
    await expect(page.getByText('Annual', { exact: true })).toBeVisible();
    await expect(page.getByText('Pending', { exact: true })).toBeVisible();
    await clickAppButton(page, 'New request');
    await expect(page.getByText('Submit request')).toBeVisible();
  });

  test('owner sees leave approval queue', async ({ page }) => {
    await loginAsOwner(page);
    await page.goto('/leaves/calendar');
    await expect(page.getByRole('heading', { name: 'Calendar' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Vacancy' })).toBeVisible();
    await expect(page.getByText('Mona Member')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Approve' }).first()).toBeVisible();
  });

  test('owner can open members leaves from sidebar', async ({ page }) => {
    await loginAsOwner(page);
    const sidebar = page.locator('app-sidebar');
    await sidebar.getByText('Leaves', { exact: true }).click();
    await sidebar.getByRole('link', { name: 'Members Leaves' }).click();
    await expect(page).toHaveURL(/\/leaves\/members/);
    await expect(page.getByRole('heading', { name: 'Members Leaves', exact: true })).toBeVisible();
  });
});

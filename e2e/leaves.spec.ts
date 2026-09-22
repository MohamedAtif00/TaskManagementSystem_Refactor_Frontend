import { test, expect, loginAsOwner, loginAsMember, clickAppButton } from './fixtures/auth';

test.describe('Leaves', () => {
  test('member sees balances and can open new request modal', async ({ page }) => {
    await loginAsMember(page);
    await page.goto('/leaves/mine');
    await expect(page.getByRole('heading', { name: 'My leaves' })).toBeVisible();
    await expect(page.getByText('Annual', { exact: true })).toBeVisible();
    await expect(page.getByText('Pending', { exact: true })).toBeVisible();
    await clickAppButton(page, 'New request');
    await expect(page.getByText('Submit request')).toBeVisible();
  });

  test('owner sees leave approval queue', async ({ page }) => {
    await loginAsOwner(page);
    await page.goto('/leaves/calendar');
    await expect(page.getByRole('heading', { name: 'Approvals' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Vacancy' })).toBeVisible();
    await expect(page.getByText('Mona Member')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Approve' }).first()).toBeVisible();
  });

  test('owner can submit bulk opinions on pending leave requests', async ({ page }) => {
    await loginAsOwner(page);
    await page.goto('/leaves/calendar');
    await expect(page.getByText('Bulk opinion')).toBeHidden();
    await page.getByLabel('Select all pending requests').check();
    await expect(page.getByText('Bulk opinion · 2 selected')).toBeVisible();
    await page.locator('textarea[name="bulkComment"]').fill('Approved in batch');
    await clickAppButton(page, 'Approve selected');
    await expect(page.getByText('2 bulk opinion(s) approved')).toBeVisible();
    await expect(page.getByText('No requests')).toBeVisible();
  });

  test('owner can open members leaves from sidebar', async ({ page }) => {
    await loginAsOwner(page);
    const sidebar = page.locator('app-sidebar');
    await sidebar.getByText('Leaves', { exact: true }).click();
    await sidebar.getByRole('link', { name: 'Members Leaves' }).click();
    await expect(page).toHaveURL(/\/leaves\/members/);
    await expect(page.getByRole('heading', { name: 'Members Leaves', exact: true })).toBeVisible();
  });

  test('member sees permission tab and work-day time picker', async ({ page }) => {
    await loginAsMember(page);
    await page.goto('/leaves/mine');
    await expect(page.getByRole('button', { name: /Permission/ })).toBeVisible();
    await clickAppButton(page, 'New request');
    await page.getByRole('button', { name: 'Permission', exact: true }).click();
    await expect(page.getByText('Leaving at')).toBeVisible();
    await expect(page.getByText('Work hours: 9:00 AM – 5:00 PM')).toBeVisible();
    await expect(page.locator('app-work-day-time-picker').getByRole('button', { name: '3:00 PM' })).toBeVisible();
  });

  test('member can submit permission with work-day slots', async ({ page }) => {
    await loginAsMember(page);
    await page.goto('/leaves/mine');
    await clickAppButton(page, 'New request');
    await page.getByRole('button', { name: 'Permission', exact: true }).click();
    await page.locator('input[name="permissionDate"]').fill('2026-12-15');
    await page.locator('app-work-day-time-picker').getByRole('button', { name: '2:00 PM', exact: true }).click();
    await clickAppButton(page, 'Submit request');
    await expect(page.getByText('Request submitted')).toBeVisible();
  });

  test('forgot clock shows work-day time picker', async ({ page }) => {
    await loginAsMember(page);
    await page.goto('/leaves/mine');
    await page.getByRole('button', { name: /Forgot clock/i }).first().click();
    await clickAppButton(page, 'New request');
    await expect(page.getByText('Work hours: 9:00 AM – 5:00 PM')).toBeVisible();
    await expect(page.locator('app-work-day-time-picker').getByRole('button', { name: '9:00 AM' })).toBeVisible();
  });
});

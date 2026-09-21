import { test, expect, loginAsOwner } from './fixtures/auth';

test.describe('Members leaves', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsOwner(page);
    await page.goto('/leaves/members');
  });

  test('shows members leave balances table', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Members Leaves', exact: true })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Annual' })).toBeVisible();
    await expect(page.getByText('Mona Member')).toBeVisible();
  });

  test('shows HR codes for members', async ({ page }) => {
    await expect(page.getByText('MEM001')).toBeVisible();
    await expect(page.getByText('TST001')).toBeVisible();
  });

  test('navigates to member detail on row click', async ({ page }) => {
    await page.getByRole('row', { name: /Mona Member/ }).click();
    await expect(page).toHaveURL(/\/leaves\/members\/5/);
  });
});

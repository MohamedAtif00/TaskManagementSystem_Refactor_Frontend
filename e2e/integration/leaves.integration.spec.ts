import { test, expect, loginAsTST001 } from './fixtures/auth-real';

test.describe('Leaves (integration)', () => {
  test('owner sees approval calendar', async ({ page }) => {
    await loginAsTST001(page);
    await page.goto('/leaves/calendar');
    await expect(page.getByRole('heading', { name: 'Calendar' })).toBeVisible();
  });

  test('members leaves table loads', async ({ page }) => {
    await loginAsTST001(page);
    await page.goto('/leaves/members');
    await expect(page.getByRole('heading', { name: 'Members Leaves', exact: true })).toBeVisible();
    await expect(page.getByText('TST001')).toBeVisible();
  });

  test('members leaves shows balance columns', async ({ page }) => {
    await loginAsTST001(page);
    await page.goto('/leaves/members');
    await expect(page.getByRole('columnheader', { name: 'Annual' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Sick' })).toBeVisible();
  });
});

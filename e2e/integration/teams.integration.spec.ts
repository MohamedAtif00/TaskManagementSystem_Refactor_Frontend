import { test, expect, loginAsTST001 } from './fixtures/auth-real';

test.describe('Teams (integration)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTST001(page);
    await page.goto('/resources/teams');
  });

  test('lists seeded teams', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Teams', exact: true })).toBeVisible();
    await expect(page.getByText(/SEED_Team_/)).toBeVisible();
  });

  test('opens edit form for a team', async ({ page }) => {
    await page.getByRole('button', { name: 'Edit' }).first().click();
    await expect(page.getByRole('heading', { name: /Edit team/i })).toBeVisible();
  });
});

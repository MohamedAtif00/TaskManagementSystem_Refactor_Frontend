import { test, expect, loginAsTST001 } from './fixtures/auth-real';

test.describe('Sprints (integration)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTST001(page);
    await page.goto('/sprints');
  });

  test('lists seeded sprints', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Sprints', exact: true })).toBeVisible();
    await expect(page.getByText(/SEED_Sprint_/)).toBeVisible();
  });

  test('opens sprint board', async ({ page }) => {
    await page.getByRole('row', { name: /SEED_Sprint_/ }).first().click();
    await expect(page.getByText('Backlog')).toBeVisible();
  });
});

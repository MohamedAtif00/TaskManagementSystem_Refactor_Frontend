import { test, expect, loginAsOwner } from './fixtures/auth';

test.describe('Sprints', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsOwner(page);
    await page.goto('/sprints');
  });

  test('lists active sprints', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Sprints', exact: true })).toBeVisible();
    await expect(page.getByText('Algebra Sprint')).toBeVisible();
    await expect(page.getByText('Physics Burst')).toBeVisible();
    await expect(page.getByText('Add Sprint')).toHaveCount(0);
  });

  test('opens sprint board from list row', async ({ page }) => {
    await page.getByRole('row', { name: /Algebra Sprint/ }).click();
    await expect(page).toHaveURL(/\/sprints\/1\/board/);
    await expect(page.getByRole('heading', { name: 'Algebra Sprint' })).toBeVisible();
    await expect(page.getByText('Graphing activity')).toBeVisible();
  });

  test('does not show archived sprint by default', async ({ page }) => {
    await expect(page.getByText('Archived Sprint')).toHaveCount(0);
  });
});

test.describe('Sprint management', () => {
  test('owner can open create sprint from admin page', async ({ page }) => {
    await loginAsOwner(page);
    await page.goto('/sprints/manage');
    await expect(page.getByRole('heading', { name: 'Sprint management', exact: true })).toBeVisible();
    await expect(page.getByText('Add Sprint')).toBeVisible();
  });
});

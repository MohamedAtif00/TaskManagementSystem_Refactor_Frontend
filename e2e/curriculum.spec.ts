import { test, expect, loginAsOwner, clickAppButton } from './fixtures/auth';

test.describe('Curriculum admin', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsOwner(page);
    await page.goto('/projects/curriculum');
  });

  test('shows curriculum tree with year node', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Curriculum', exact: true })).toBeVisible();
    await expect(page.getByText('2026')).toBeVisible();
    await expect(page.getByText('Primary 2026')).toBeVisible();
  });

  test('expands year to show project and term', async ({ page }) => {
    await page.getByRole('button', { name: '▸' }).first().click();
    await expect(page.getByText('Term 1')).toBeVisible();
    await expect(page.getByText('Algebra')).toBeVisible();
  });

  test('opens add year modal', async ({ page }) => {
    await clickAppButton(page, 'Add year');
    await expect(page.getByRole('heading', { name: /Create Year/i })).toBeVisible();
    await clickAppButton(page, 'Cancel');
  });
});

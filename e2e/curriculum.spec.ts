import { test, expect, loginAsOwner, clickAppButton } from './fixtures/auth';

test.describe('Curriculum admin', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsOwner(page);
    await page.goto('/projects/curriculum');
  });

  test('shows curriculum tree with year node', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Curriculum', exact: true })).toBeVisible();
    await expect(page.getByText('2026', { exact: true })).toBeVisible();
  });

  test('expands year to show project and term', async ({ page }) => {
    await page.getByRole('button', { name: 'Expand 2026' }).click();
    await expect(page.getByText('Primary 2026')).toBeVisible();
    await page.getByRole('button', { name: 'Expand Primary 2026' }).click();
    await expect(page.getByText('Term 1')).toBeVisible();
  });

  test('filters the tree by search', async ({ page }) => {
    await page.getByPlaceholder('Search years, subjects, LOs').fill('Algebra');
    await expect(page.getByText('Algebra')).toBeVisible();
    await expect(page.getByText('2026', { exact: true })).toBeVisible();
  });

  test('opens add year modal', async ({ page }) => {
    await clickAppButton(page, 'Add year');
    await expect(page.getByRole('heading', { name: /Create Year/i })).toBeVisible();
    await clickAppButton(page, 'Cancel');
  });
});

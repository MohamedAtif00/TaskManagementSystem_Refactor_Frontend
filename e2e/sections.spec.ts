import { test, expect, loginAsOwner, clickAppButton } from './fixtures/auth';

test.describe('Sections', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsOwner(page);
    await page.goto('/resources/sections');
  });

  test('lists sections with head and teams', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Sections', exact: true })).toBeVisible();
    await expect(page.getByText('STEM')).toBeVisible();
    await expect(page.getByText('Sarah Section Head')).toBeVisible();
  });

  test('opens create section modal', async ({ page }) => {
    await clickAppButton(page, 'Add section');
    await expect(page.getByRole('heading', { name: /Create section/i })).toBeVisible();
    await clickAppButton(page, 'Cancel');
  });

  test('shows teams column', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: 'Teams' })).toBeVisible();
    await expect(page.getByText('Math Team')).toBeVisible();
  });
});

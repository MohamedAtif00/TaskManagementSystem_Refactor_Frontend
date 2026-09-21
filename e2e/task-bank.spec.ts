import { test, expect, loginAsOwner, clickAppButton } from './fixtures/auth';

test.describe('Task bank', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsOwner(page);
    await page.goto('/workflows/task-bank');
  });

  test('lists task bank items', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Task bank', exact: true })).toBeVisible();
    await expect(page.getByText('Create ticket')).toBeVisible();
    await expect(page.getByText('Review content')).toBeVisible();
  });

  test('opens create item modal', async ({ page }) => {
    await clickAppButton(page, 'Add item');
    await expect(page.getByRole('heading', { name: /Create item/i })).toBeVisible();
    await clickAppButton(page, 'Cancel');
  });

  test('shows duration and type columns', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: 'Duration' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Type' })).toBeVisible();
  });
});

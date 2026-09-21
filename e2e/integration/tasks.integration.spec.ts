import { test, expect, loginAsTST001 } from './fixtures/auth-real';

test.describe('Tasks / Kanban (integration)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTST001(page);
  });

  test('lists seeded subjects', async ({ page }) => {
    await page.goto('/tasks');
    await expect(page.getByRole('heading', { name: 'Kanban', exact: true })).toBeVisible();
    await expect(page.getByText(/SEED_Subject_/)).toBeVisible();
  });

  test('opens a subject board with columns', async ({ page }) => {
    await page.goto('/tasks');
    await page.getByRole('row', { name: /SEED_Subject_/ }).first().click();
    await expect(page.getByText('Backlog')).toBeVisible();
    await expect(page.getByText('To Do')).toBeVisible();
    await expect(page.getByText('Doing')).toBeVisible();
    await expect(page.getByText('Done')).toBeVisible();
  });

  test('shows progress column on subject list', async ({ page }) => {
    await page.goto('/tasks');
    await expect(page.getByRole('columnheader', { name: 'Progress' })).toBeVisible();
  });

  test('board shows ticket cards when present', async ({ page }) => {
    await page.goto('/tasks');
    await page.getByRole('row', { name: /SEED_Subject_/ }).first().click();
    const cards = page.locator('app-task-card');
    await expect(cards.first()).toBeVisible({ timeout: 30_000 });
  });
});

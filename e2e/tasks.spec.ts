import { test, expect, loginAsOwner, clickAppButton } from './fixtures/auth';



test.describe('Tasks / Kanban', () => {

  test.beforeEach(async ({ page }) => {

    await loginAsOwner(page);

  });



  test('lists subjects and opens a project board', async ({ page }) => {

    await page.getByRole('link', { name: 'Kanban' }).click();

    await expect(page.getByRole('heading', { name: 'Kanban', exact: true })).toBeVisible();

    await expect(page.getByText('Algebra')).toBeVisible();

    await page.getByRole('row', { name: /Algebra/ }).click();

    await expect(page).toHaveURL(/\/tasks\/11\/board/);

    await expect(page.getByRole('heading', { name: 'Algebra' })).toBeVisible();

    await expect(page.getByText('Backlog')).toBeVisible();

    await expect(page.getByText('Draft linear worksheet')).toBeVisible();

  });



  test('filters subjects by year and term', async ({ page }) => {

    await page.goto('/tasks');

    await page.locator('select').nth(0).selectOption('2026');

    await page.locator('select').nth(1).selectOption('Term 1');

    await expect(page.getByText('Algebra')).toBeVisible();

  });



  test('shows progress percent column', async ({ page }) => {

    await page.goto('/tasks');

    await expect(page.getByRole('columnheader', { name: 'Progress' })).toBeVisible();

  });



  test('opens task sheet view', async ({ page }) => {

    await page.goto('/tasks/11/board');

    await clickAppButton(page, 'Sheet View');

    await expect(page).toHaveURL(/\/tasks\/11\/sheet/);

  });



  test('opens new task modal on project board', async ({ page }) => {

    await page.goto('/tasks/11/board');

    await clickAppButton(page, 'New Task');

    const modal = page.locator('app-new-task-modal');

    await expect(modal.getByRole('heading', { name: 'New Task' })).toBeVisible();

    await expect(modal.getByText('Learning objective')).toBeVisible();

    await expect(modal.getByText('Task bank')).toBeVisible();

  });



  test('opens task drawer from a card', async ({ page }) => {

    await page.goto('/tasks/11/board');

    await page.getByRole('button', { name: 'Draft linear worksheet' }).click();

    await expect(page.getByRole('dialog')).toBeVisible();

    await expect(page.getByRole('button', { name: 'Close' })).toBeVisible();

  });



  test('drawer shows task details', async ({ page }) => {

    await page.goto('/tasks/11/board');

    await page.getByRole('button', { name: 'Draft linear worksheet' }).click();

    await expect(page.getByRole('dialog')).toBeVisible();

    await expect(page.getByText('Solve linear equations')).toBeVisible();

    await expect(page.getByText('Backlog')).toBeVisible();

  });

});



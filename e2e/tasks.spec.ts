import { test, expect, loginAsOwner, clickAppButton } from './fixtures/auth';



test.describe('Tasks / Kanban', () => {

  test.beforeEach(async ({ page }) => {

    await loginAsOwner(page);

  });



  test('lists subjects and opens a project board', async ({ page }) => {

    await page.getByRole('link', { name: 'Kanban' }).click();

    await expect(page.getByRole('heading', { name: 'Kanban', exact: true })).toBeVisible();

    await expect(page.getByRole('cell', { name: 'Algebra' }).first()).toBeVisible();

    await page.getByRole('row', { name: /Algebra/ }).first().click();

    await expect(page).toHaveURL(/\/tasks\/11\/board/);

    await expect(page.getByRole('heading', { name: 'Algebra' })).toBeVisible();

    await expect(page.getByText('Backlog')).toBeVisible();

    await expect(page.getByText('Draft linear worksheet')).toBeVisible();

  });



  test('filters subjects by year and term', async ({ page }) => {

    await page.goto('/tasks');

    await page.locator('select').nth(0).selectOption('2026');

    await page.locator('select').nth(1).selectOption('Term 1');

    await expect(page.getByRole('cell', { name: 'Algebra' }).first()).toBeVisible();

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



  test('loads board with a single ticket page request', async ({ page }) => {
    const ticketRequests: string[] = [];
    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('/subjects/11/tickets')) {
        ticketRequests.push(url);
      }
    });

    await page.goto('/tasks/11/board');

    await expect(page.getByText('Draft linear worksheet')).toBeVisible();
    expect(ticketRequests.length).toBe(1);
    expect(ticketRequests[0]).toMatch(/page=1/);
    expect(ticketRequests[0]).not.toMatch(/status=/);
  });

  test('opens centered task modal from a card', async ({ page }) => {
    await page.goto('/tasks/11/board');

    await page.getByRole('button', { name: 'Draft linear worksheet' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(page.getByRole('button', { name: 'Close' })).toBeVisible();

    const box = await dialog.boundingBox();
    const viewport = page.viewportSize();
    if (box && viewport) {
      const dialogCenterX = box.x + box.width / 2;
      const viewportCenterX = viewport.width / 2;
      expect(Math.abs(dialogCenterX - viewportCenterX)).toBeLessThan(viewport.width * 0.15);
    }
  });



  test('task modal shows task details', async ({ page }) => {
    await page.goto('/tasks/11/board');

    await page.getByRole('button', { name: 'Draft linear worksheet' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    await expect(dialog.getByText('Solve linear equations').first()).toBeVisible();
    await expect(dialog.getByText('Backlog').first()).toBeVisible();
    await expect(dialog.getByText('Recent Activity')).toBeVisible();
    await expect(dialog.getByText('Draft linear worksheet was created.')).toBeVisible();
    await expect(dialog.getByText('45')).toBeVisible();
  });

  test('task modal is wider than compact dialog', async ({ page }) => {
    await page.goto('/tasks/11/board');
    await page.getByRole('button', { name: 'Draft linear worksheet' }).click();

    const dialog = page.getByRole('dialog');
    const box = await dialog.boundingBox();
    const viewport = page.viewportSize();
    expect(box && viewport).toBeTruthy();
    if (box && viewport) {
      expect(box.width).toBeGreaterThan(viewport.width * 0.55);
    }
  });

});



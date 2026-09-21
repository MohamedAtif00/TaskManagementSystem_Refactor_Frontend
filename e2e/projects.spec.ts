import { test, expect, loginAsOwner, clickAppButton } from './fixtures/auth';

test.describe('Projects', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsOwner(page);
    await page.goto('/projects');
  });

  test('owner can view project list', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Projects', exact: true })).toBeVisible();
    await expect(page.getByPlaceholder('Search projects')).toBeVisible();
    await expect(page.getByText('Primary 2026')).toBeVisible();
  });

  test('owner can open create project modal', async ({ page }) => {
    await clickAppButton(page, 'Add project');
    await expect(page.getByRole('heading', { name: /Create project/i })).toBeVisible();
    await expect(page.getByLabel('Year')).toBeVisible();
  });

  test('owner can submit create project form', async ({ page }) => {
    await clickAppButton(page, 'Add project');
    await page.locator('select[name="yearId"]').selectOption('1');
    await page.locator('input[name="projectName"]').fill('Prep 2026');
    await page.locator('textarea[name="projectDescription"]').fill('New prep project');
    await clickAppButton(page, 'Save');
    await expect(page.getByText('Project created')).toBeVisible();
  });

  test('owner can open edit project modal', async ({ page }) => {
    await page.getByRole('button', { name: 'Edit' }).first().click();
    await expect(page.getByRole('heading', { name: /Edit project/i })).toBeVisible();
    await clickAppButton(page, 'Cancel');
  });

  test('owner can open archive project confirm', async ({ page }) => {
    await page.getByRole('button', { name: 'Archive' }).first().click();
    await expect(page.getByRole('heading', { name: /Archive project/i })).toBeVisible();
    await clickAppButton(page, 'Cancel');
  });
});

import { test, expect, loginAsOwner, clickAppButton } from './fixtures/auth';

test.describe('Teams', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsOwner(page);
    await page.goto('/resources/teams');
  });

  test('owner can list teams', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Teams', exact: true })).toBeVisible();
    await expect(page.getByText('Math Team')).toBeVisible();
  });

  test('owner can open edit form with members', async ({ page }) => {
    await page.getByRole('button', { name: 'Edit' }).first().click();
    await expect(page.getByRole('heading', { name: /Edit team/i })).toBeVisible();
    await expect(page.getByText('Mona Member')).toBeVisible();
    await clickAppButton(page, 'Cancel');
  });

  test('owner can open create team modal', async ({ page }) => {
    await clickAppButton(page, 'Add team');
    await expect(page.getByRole('heading', { name: /Create team/i })).toBeVisible();
    await clickAppButton(page, 'Cancel');
  });

  test('owner can toggle team members and save', async ({ page }) => {
    await page.getByRole('button', { name: 'Edit' }).nth(1).click();
    await expect(page.getByRole('heading', { name: /Edit team/i })).toBeVisible();
    await page.locator('input[type="checkbox"]').first().check();
    await clickAppButton(page, 'Save');
    await expect(page.getByText('Team updated')).toBeVisible();
  });
});

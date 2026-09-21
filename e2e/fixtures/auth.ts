import { Page, test as base, expect } from '@playwright/test';
import { setupApiMocks } from './api-mocks';

export { expect };

export const test = base.extend({
  page: async ({ page }, use) => {
    await setupApiMocks(page);
    await use(page);
  },
});

export async function login(page: Page, code: string): Promise<void> {
  await page.goto('/auth/sign-in', { waitUntil: 'domcontentloaded' });
  await page.locator('#code').fill(code);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

export async function loginAsOwner(page: Page): Promise<void> {
  await login(page, 'TST001');
}

export async function loginAsMember(page: Page): Promise<void> {
  await login(page, 'MEM001');
}

export async function loginAsProjectManager(page: Page): Promise<void> {
  await login(page, 'PM001');
}

export async function loginAsTeamLeader(page: Page): Promise<void> {
  await login(page, 'TL001');
}

export async function loginAsSectionHead(page: Page): Promise<void> {
  await login(page, 'SH001');
}

export async function logout(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Open user menu' }).click();
  await page.getByText('Log out', { exact: true }).click();
  await expect(page).toHaveURL(/\/auth\/sign-in/);
}

export async function clickAppButton(page: Page, name: string): Promise<void> {
  await page
    .locator('app-button')
    .filter({ hasText: name })
    .evaluate((element) => (element.querySelector('button') as HTMLButtonElement | null)?.click());
}

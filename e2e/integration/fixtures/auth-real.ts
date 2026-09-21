import { Page, expect } from '@playwright/test';

export { expect };

export async function loginAsTST001(page: Page): Promise<void> {
  await page.goto('/auth/sign-in', { waitUntil: 'domcontentloaded' });
  await page.locator('#code').fill('TST001');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

export async function clickAppButton(page: Page, name: string): Promise<void> {
  await page
    .locator('app-button')
    .filter({ hasText: name })
    .evaluate((element) => (element.querySelector('button') as HTMLButtonElement | null)?.click());
}

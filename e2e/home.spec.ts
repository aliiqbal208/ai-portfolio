import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test.beforeEach(async () => {
    if (!process.env.VERITY_E2E_EMAIL) test.skip(true, 'E2E credentials not configured');
  });
  test('loads and shows hero content', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Muhammad Ali/);
    await expect(page.getByRole('heading', { name: 'AI Portfolio' })).toBeVisible();
    await expect(page.getByText("Hey, I'm Muhammad Ali", { exact: false })).toBeVisible();
  });
});

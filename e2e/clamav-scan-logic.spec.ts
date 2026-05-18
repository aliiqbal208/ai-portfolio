import { test, expect } from '@playwright/test';

test.beforeEach(async () => {
  if (!process.env.VERITY_E2E_EMAIL) test.skip(true, 'E2E credentials not configured');
});

test('home page loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('body')).toBeVisible();
});

import { test, expect } from '@playwright/test';

test.beforeEach(async () => {
  if (!process.env.PLAYWRIGHT_BASE_URL) {
    test.skip(true, 'E2E base URL not configured');
  }
});

test('homepage renders hero and title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Muhammad Ali – AI Portfolio/i);
  await expect(page.getByRole('heading', { level: 1, name: /AI Portfolio/i })).toBeVisible();
  await expect(page.getByAltText(/Hero memoji/i)).toBeVisible();
});

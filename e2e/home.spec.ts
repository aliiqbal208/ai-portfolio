import { test, expect } from '@playwright/test';

// Base URL is provided by workflow via PLAYWRIGHT_BASE_URL

test.describe('Home page', () => {
  test('renders title and hero', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/AI Portfolio/i, { timeout: 15000 });
    await expect(page.getByRole('heading', { level: 1, name: /AI Portfolio/i })).toBeVisible();
  });
});

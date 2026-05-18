import { test, expect } from '@playwright/test';

// Smoke test: verifies homepage renders the main title.
// Skips automatically if PLAYWRIGHT_BASE_URL is not configured by CI.

test.describe('Homepage smoke', () => {
  test.beforeEach(async () => {
    if (!process.env.PLAYWRIGHT_BASE_URL) test.skip(true, 'Base URL not configured');
  });

  test('shows "AI Portfolio" heading', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'AI Portfolio' })).toBeVisible();
  });
});

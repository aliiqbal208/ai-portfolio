import { test, expect } from '@playwright/test';

// This repo has no ClamAV feature. Keep a focused, skipped test to document intent.
test.describe('ClamAV scanning flow (not implemented)', () => {
  test.beforeAll(() => {
    test.skip(true, 'ClamAV scanning feature not present in this repository');
  });

  test('upload is scanned and blocked when infected', async ({ page }) => {
    await page.goto('/');
    // If/when implemented, navigate to the upload page and assert verdict UI.
    await expect(page).toHaveTitle(/ai|portfolio/i);
  });
});

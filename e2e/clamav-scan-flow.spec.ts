import { test, expect } from '@playwright/test';

// Skipped until Go ClamAV backend is wired to this frontend.

test.describe('Upload scanning', () => {
  test.beforeEach(async () => {
    if (!process.env.PLAYWRIGHT_BASE_URL) test.skip(true, 'Base URL not configured');
  });

  test('blocks infected files and allows clean uploads', async ({ page }) => {
    test.skip(true, 'Go ClamAV backend not available in this repo');
    await page.goto('/');
  });
});

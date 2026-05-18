import { test, expect } from '@playwright/test';

// This repository has no Go/ClamAV backend.
// Keep this test in place so the CI discovers an e2e file, but skip it.
// When a ClamAV API is added (e.g., /api/scan), replace this with real flow tests.

test.describe('ClamAV integration (placeholder)', () => {
  test.beforeAll(() => {
    test.skip(true, 'Go + ClamAV service not present in this repo');
  });

  test('home page renders', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Muhammad Ali/i);
  });
});

import { test, expect } from '@playwright/test';

// This spec documents that Issue #18 is not applicable to this repository.
// It intentionally skips all tests so CI remains unaffected if discovered.

test.describe('ClamAV scanning logic', () => {
  test.beforeEach(async () => {
    test.skip(true, 'No ClamAV scanning logic in this repository (Issue #18).');
  });

  test('placeholder (skipped)', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/.*/);
  });
});

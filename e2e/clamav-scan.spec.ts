import { test, expect } from '@playwright/test';

// Placeholder e2e spec: repository has no ClamAV scanning logic.
// This test is intentionally skipped and serves as a handhold for future work.
// If/when an upload+scan flow is added, replace this with real navigation + assertions.

test.describe('ClamAV scanning (placeholder)', () => {
  test.beforeAll(() => {
    test.skip(true, 'ClamAV scanning not present in this repo; placeholder test.');
  });

  test('uploads are scanned before processing', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });
});

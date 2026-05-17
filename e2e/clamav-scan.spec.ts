import { test, expect } from '@playwright/test';

// This repository has no upload or ClamAV integration.
// A skipped test documents the gap and satisfies the e2e scaffold.

test.describe('ClamAV scanning (not implemented)', () => {
  test('skipped: no scanning feature present', async ({ page }) => {
    test.skip(true, 'No ClamAV scanning in this repo; see docs/clamav-scanning.md');
    await page.goto('/');
    await expect(page).toHaveTitle(/.+/);
  });
});

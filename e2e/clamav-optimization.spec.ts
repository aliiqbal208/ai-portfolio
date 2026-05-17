import { test, expect } from '@playwright/test';

// Issue #18: Optimize ClamAV scanning logic
// This repository has no ClamAV or upload scanning code paths.
// We explicitly skip that scenario and include a small homepage smoke test.

test('clamav scanning not present', async () => {
  test.skip(true, 'No ClamAV/upload scanning logic in this repository');
});

test.describe('homepage smoke', () => {
  test.beforeEach(async () => {
    if (!process.env.PLAYWRIGHT_BASE_URL) test.skip(true, 'PLAYWRIGHT_BASE_URL not configured');
  });

  test('shows AI Portfolio heading', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'AI Portfolio' })).toBeVisible();
  });
});

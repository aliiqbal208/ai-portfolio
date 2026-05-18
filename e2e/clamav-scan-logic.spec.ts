import { test, expect } from '@playwright/test';

// e2e sanity for Issue #18: 'optimise clamav scaniing logic'
// This repository contains no ClamAV code; keep a focused, skipped test.
// If a base URL is provided, perform a tiny smoke check on the homepage.

test.describe('ClamAV scanning logic', () => {
  test('skipped: no ClamAV logic present in this repo', async () => {
    test.skip(true, 'No ClamAV scanning logic exists in this codebase.');
  });

  test('homepage renders key headings', async ({ page }) => {
    if (!process.env.PLAYWRIGHT_BASE_URL) test.skip(true, 'PLAYWRIGHT_BASE_URL not set');
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'AI Portfolio' })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Muhammad Ali/i })).toBeVisible();
  });
});

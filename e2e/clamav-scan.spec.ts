import { test, expect } from '@playwright/test';

// This repository has no antivirus/ClamAV integration.
// Keep this file to document intent and prevent false assumptions.
// When a scan feature is added, replace this skip with real flow tests.

test.describe('ClamAV scanning', () => {
  test.skip(true, 'No antivirus/ClamAV feature exists in this repo as of 2026-05-17');

  test('uploads are scanned before acceptance', async ({ page }) => {
    // Placeholder: implement when feature exists.
    await page.goto('/');
    await expect(page).toHaveTitle(/AI Portfolio/i);
  });
});

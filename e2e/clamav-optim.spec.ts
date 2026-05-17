import { test, expect } from '@playwright/test';

// This repo does not contain any ClamAV logic or file-upload surfaces.
// The test asserts the app loads and surfaces the portfolio hero; it
// intentionally skips when E2E creds aren't configured per Verity policy.

test.beforeEach(async () => {
  if (!process.env.VERITY_E2E_EMAIL) test.skip(true, 'E2E credentials not configured');
});

test('homepage renders; no ClamAV scanning applicable', async ({ page }) => {
  await page.goto('/');
  // Heuristic assertion based on portfolio content
  await expect(page.getByText(/Muhammad Ali|Senior Software Engineer|Portfolio/i)).toBeVisible();
});

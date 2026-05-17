import { test, expect } from '@playwright/test';

// This repository has no ClamAV integration. This spec documents that fact
// and ensures the e2e suite remains structured. It will be skipped with
// a clear reason so CI signals are accurate without adding new deps.

test.beforeEach(async () => {
  if (!process.env.PLAYWRIGHT_BASE_URL) test.skip(true, 'E2E base URL not configured');
});

test('ClamAV scanning flow is not present (documented skip)', async ({ page }) => {
  test.skip(true, 'No ClamAV scanning feature exists in this repo');
  await page.goto('/');
  await expect(page).toHaveTitle(/Ali|Portfolio/i);
});

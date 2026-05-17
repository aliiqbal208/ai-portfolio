import { test, expect } from '@playwright/test';

// Issue #12: Backend (Go + ClamAV) does not exist in this repo.
// Provide a clear, skipped test explaining the mismatch, plus a smoke test.

test.describe('Issue #12 — Go/ClamAV backend', () => {
  test('skipped: backend not present in this repo', async () => {
    test.skip(true, 'No Go/ClamAV backend code found in this repository');
  });
});

// Minimal smoke test to ensure the site loads while Issue #12 is deferred.

test('homepage loads and shows AI Portfolio title', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('text=AI Portfolio').first()).toBeVisible();
});

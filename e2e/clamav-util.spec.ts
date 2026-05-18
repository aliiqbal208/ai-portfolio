import { test, expect } from '@playwright/test';

// This repo contains no Go/ClamAV code. Issue #12 appears mis-scoped
// against this Next.js portfolio. Keep a skipped test to document state
// and to integrate smoothly with Verity's e2e runner when configured.

test.beforeEach(async () => {
  if (!process.env.PLAYWRIGHT_BASE_URL) test.skip(true, 'Base URL not configured');
});

// Document the mismatch explicitly so maintainers see it in e2e output
// if/when e2e is enabled.

test('ClamAV util logic not present (skipped)', async () => {
  test.skip(true, 'No Go/ClamAV logic in this repo; nothing to test.');
});

// Smoke test to ensure site renders when e2e is wired up.
// Uses relative path; base URL provided by workflow via PLAYWRIGHT_BASE_URL.

test('homepage renders title', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Muhammad Ali')).toBeVisible();
});

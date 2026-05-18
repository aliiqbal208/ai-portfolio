import { test, expect } from '@playwright/test';

// Smoke test for homepage rendering. Placed under tests/e2e to avoid
// altering CI autodetection in this repo (no Playwright deps).
// Uses base URL provided by the workflow if present.

test('homepage renders title', async ({ page }) => {
  const base = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000';
  await page.goto(base + '/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/AI Portfolio/i);
});

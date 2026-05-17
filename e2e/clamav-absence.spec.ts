import { test, expect } from '@playwright/test';

// This repository has no ClamAV scanning logic. This e2e test
// provides a guard to ensure the app remains free from a heavy
// '/api/scan' endpoint and also sanity-checks the home page.

// Base URL is supplied by the workflow via PLAYWRIGHT_BASE_URL.

test('home loads and shows AI Portfolio UI', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Muhammad Ali/i);
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/AI Portfolio/i);
  await expect(page.getByPlaceholder('Ask me anything…')).toBeVisible();
});

// Negative check: there should be no heavyweight scan endpoint.
// If someone later adds '/api/scan', this will fail loudly.
// We use the APIRequestContext to avoid navigating away from the UI.

test('no /api/scan endpoint exists (404 expected)', async ({ request }) => {
  const res = await request.get('/api/scan');
  expect(res.status()).toBe(404);
});

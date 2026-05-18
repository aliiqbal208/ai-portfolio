import { test, expect } from '@playwright/test';

// Minimal smoke test: homepage renders and shows the hero heading.
// Uses PLAYWRIGHT_BASE_URL (set by CI) so navigation can be relative.

test('homepage shows AI Portfolio heading', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText(/AI Portfolio/i);
});

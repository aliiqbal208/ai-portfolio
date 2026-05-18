import { test, expect } from '@playwright/test';

// Smoke test: homepage renders and quick-question routes to /chat.
// Safe to run in any environment; no auth required.
// If a base URL isn't configured by the workflow, skip gracefully.

test.beforeEach(async () => {
  const baseUrl = process.env.PLAYWRIGHT_BASE_URL || '';
  if (!baseUrl) test.skip(true, 'PLAYWRIGHT_BASE_URL not configured');
});

test('home renders and navigates to chat via quick question', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'AI Portfolio' })).toBeVisible();
  // Click the quick-question button labeled Me to navigate to chat.
  await page.getByRole('button', { name: 'Me' }).click();
  await expect(page).toHaveURL(/\/chat\?query=/);
  await expect(page.getByText(/Loading chat/i)).toBeVisible();
});

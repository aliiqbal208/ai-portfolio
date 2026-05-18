import { test, expect } from '@playwright/test';

// Skip when E2E credentials are not set (per repo guidance)
test.beforeEach(async () => {
  if (!process.env.VERITY_E2E_EMAIL) test.skip(true, 'E2E credentials not configured');
});

// Smoke-check the homepage renders key hero elements
// Uses relative navigation so CI sets PLAYWRIGHT_BASE_URL
 test('homepage renders and quick action navigates', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText(/AI Portfolio/i);
  await expect(page.getByAltText('Hero memoji')).toBeVisible();

  // Click a quick question and ensure we route to chat
  const meButton = page.getByRole('button', { name: /^Me$/ });
  await meButton.click();
  await expect(page).toHaveURL(/\/chat\?query=/);
});

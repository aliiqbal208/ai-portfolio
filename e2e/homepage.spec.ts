import { test, expect } from '@playwright/test';

// Basic smoke check for the portfolio homepage
// Verifies hero renders and the CTA input exists.

test('homepage renders hero and input', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText(/AI Portfolio/i);
  await expect(page.getByPlaceholder(/Ask me anything/)).toBeVisible();
});

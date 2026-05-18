import { test, expect } from '@playwright/test';

// Basic smoke test for the portfolio homepage and chat navigation.
// Uses relative URLs; base URL is provided via PLAYWRIGHT_BASE_URL by CI.

test.describe('Homepage', () => {
  test('loads and shows hero content', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Muhammad Ali/i);
    await expect(page.getByRole('heading', { level: 1, name: /AI Portfolio/i })).toBeVisible();
    await expect(page.getByText(/Hey, I'm Muhammad Ali/i)).toBeVisible();
  });

  test('submits quick question via input and routes to chat', async ({ page }) => {
    await page.goto('/');
    const input = page.getByPlaceholder('Ask me anything…');
    await input.fill('Who are you?');
    await input.press('Enter');
    await page.waitForURL(/\/chat\?query=/);
    await expect(page).toHaveURL(/\/chat\?query=/);
    await expect(page.getByText(/Loading chat…/i)).toBeVisible({ timeout: 10000 });
  });
});

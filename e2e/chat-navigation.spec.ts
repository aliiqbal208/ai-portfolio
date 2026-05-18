import { test, expect } from '@playwright/test';

// Basic smoke: Home → Chat quick question path

test.describe('Chat quick navigation', () => {
  test('home loads and quick question navigates to chat', async ({ page }) => {
    if (!process.env.PLAYWRIGHT_BASE_URL) test.skip(true, 'E2E base URL not configured');

    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1, name: /AI Portfolio/i })).toBeVisible();

    await page.getByRole('button', { name: 'Me' }).click();
    await expect(page).toHaveURL(/\/chat(\?|$)/);
  });
});

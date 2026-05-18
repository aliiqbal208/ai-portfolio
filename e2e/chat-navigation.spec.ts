import { test, expect } from '@playwright/test';

// Basic navigation test: home -> chat page without invoking AI API
// Uses base URL from env when provided, else falls back to localhost:3000
const BASE = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

// Retry a bit in CI since dev servers can take a moment to warm up
test.describe('Chat navigation', () => {
  test('navigates from home to chat and shows input', async ({ page }) => {
    await page.goto();

    // Expect hero title to ensure home loaded
    await expect(page.getByRole('heading', { name: 'AI Portfolio' })).toBeVisible();

    // Click a quick question button labeled Me to navigate to chat
    const meButton = page.getByRole('button', { name: 'Me' });
    await expect(meButton).toBeVisible();
    await meButton.click();

    // Wait for URL to include /chat and for the chat input placeholder to appear
    await expect(page).toHaveURL(/\/chat/);
    await expect(page.getByPlaceholder('Ask me anything')).toBeVisible();
  });
});

import { test, expect } from '@playwright/test';

// Smoke-check home → chat navigation and input presence
test.describe('Chat navigation', () => {
  test('Home loads and navigates to chat', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/AI Portfolio/i);

    // Click a quick question button (e.g., Me)
    const meButton = page.getByRole('button', { name: /^Me$/ });
    await expect(meButton).toBeVisible();
    await meButton.click();

    // URL should change to /chat with a query param
    await expect(page).toHaveURL(/\/chat\?query=/);

    // Chat input should be visible
    const textbox = page.getByRole('textbox');
    await expect(textbox).toBeVisible();
  });
});

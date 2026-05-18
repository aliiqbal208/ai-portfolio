
import { test, expect } from '@playwright/test';

// Basic smoke tests for landing -> chat flow (no auth required)

test.describe('Landing to Chat flow', () => {
  test('loads home and shows hero', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'AI Portfolio' })).toBeVisible();
  });

  test('quick question button navigates to /chat', async ({ page }) => {
    await page.goto('/');
    // Click the "Me" quick button by its accessible name
    await page.getByRole('button', { name: 'Me' }).click();
    await expect(page).toHaveURL(/\/chat/);
    // Chat input is present
    const input = page.locator('input[placeholder*="Ask me anything"]');
    await expect(input).toBeVisible();
  });
});

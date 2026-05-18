
import { test, expect } from '@playwright/test';

test.describe('Home → Chat smoke', () => {
  test('navigate via quick question and see chat UI', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'AI Portfolio' })).toBeVisible();
    await page.getByRole('button', { name: 'Me' }).click();
    await expect.poll(() => page.url()).toContain('/chat?');
    await expect(page.locator('input[placeholder="Ask me anything"]')).toBeVisible();
  });
});

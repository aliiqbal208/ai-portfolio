import { test, expect } from '@playwright/test';

test('navigate to \/chat shows landing', async ({ page }) => {
  await page.goto('/chat');
  await expect(page).toHaveURL(/\/chat/);
});

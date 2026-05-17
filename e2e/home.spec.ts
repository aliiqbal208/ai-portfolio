import { test, expect } from '@playwright/test';

// Basic sanity check for the landing page UI and navigation to chat
test('home loads and quick-question navigates to chat', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'AI Portfolio' })).toBeVisible();

  const firstQuick = page.getByRole('button').first();
  await firstQuick.click();

  await expect(page).toHaveURL(/\/chat\?query=/);
});

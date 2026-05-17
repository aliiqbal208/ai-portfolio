import { test, expect } from '@playwright/test';

test('homepage renders key content', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /AI Portfolio/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Hey, I\'m Muhammad Ali/i })).toBeVisible();
  await expect(page.getByPlaceholder('Ask me anything…')).toBeVisible();
});

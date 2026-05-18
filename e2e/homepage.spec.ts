import { test, expect } from '@playwright/test';

test('homepage renders hero content', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: /AI Portfolio/i })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: /Hey, I'm Muhammad Ali/i })).toBeVisible();
});

import { test, expect } from '@playwright/test';

test('homepage shows AI Portfolio heading', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/AI Portfolio/i);
  await expect(page.getByRole('heading', { name: /AI Portfolio/i })).toBeVisible();
});

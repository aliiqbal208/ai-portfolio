import { test, expect } from '@playwright/test';

test('home has hero title', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /AI Portfolio/i })).toBeVisible();
});

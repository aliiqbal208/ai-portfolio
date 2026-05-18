import { test, expect } from '@playwright/test';

// Basic smoke test for the public home page
test('home renders title and hero text', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Muhammad Ali – AI Portfolio/);
  await expect(page.getByRole('heading', { name: /AI Portfolio/i })).toBeVisible();
});

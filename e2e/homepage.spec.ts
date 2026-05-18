import { test, expect } from '@playwright/test';

test('homepage renders portfolio title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Muhammad Ali – AI Portfolio|AI Portfolio/i);
  await expect(page.getByText(/AI Portfolio/i).first()).toBeVisible();
});

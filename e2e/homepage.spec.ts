import { test, expect } from '@playwright/test';

test('homepage shows title and Contact me button', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Muhammad Ali – AI Portfolio/);
  const contactBtn = page.getByRole('button', { name: /Contact me/i });
  await expect(contactBtn).toBeVisible();
});

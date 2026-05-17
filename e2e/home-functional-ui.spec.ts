import { test, expect } from '@playwright/test';

test('home input autoFocus works', async ({ page }) => {
  await page.goto('/');
  const input = page.locator('input[type=text]');
  await expect(input).toBeVisible();
  await expect(input).toBeFocused();
});

test('quick question button navigates to chat', async ({ page }) => {
  await page.goto('/');
  const btn = page.getByRole('button', { name: /Skills/i });
  await expect(btn).toBeVisible();
  await btn.click();
  await expect(page).toHaveURL(/\/chat\?query=/);
});

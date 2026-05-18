
import { test, expect } from '@playwright/test';

test('homepage renders and navigates to chat', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/AI Portfolio/i);
  await expect(page.getByRole('heading', { name: /AI Portfolio/i })).toBeVisible();

  const input = page.getByPlaceholder(/Ask me anything/i);
  await expect(input).toBeVisible();
  await input.fill('Who are you? I want to know more about you.');

  await page.getByRole('button', { name: 'Submit question' }).click();
  await expect(page).toHaveURL(/\/chat\?query=/);
});

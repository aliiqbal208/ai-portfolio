import { test, expect } from '@playwright/test';

test('homepage renders hero and CTA', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText(/AI Portfolio/i);
  await expect(page.getByRole('button', { name: /submit question/i })).toBeVisible();
});

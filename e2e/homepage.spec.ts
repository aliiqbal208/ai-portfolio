
import { test, expect } from '@playwright/test';

test('homepage shows title and input', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /AI Portfolio/i })).toBeVisible();
  await expect(page.getByPlaceholder('Ask me anything…')).toBeVisible();
});

import { test, expect } from '@playwright/test';

 test('homepage shows hero heading', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'AI Portfolio' })).toBeVisible();
});

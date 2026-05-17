import { test, expect } from '@playwright/test';

test('home Loads smoke page', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'AI Portfolio' })).toBeVisible();
});

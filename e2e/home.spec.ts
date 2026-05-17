import { test, expect } from '@playwright/test';

test('home loads and shows AI Portfolio heading', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'AI Portfolio' })).toBeVisible();
});

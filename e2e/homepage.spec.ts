import { test, expect } from '@playwright/test';

test('homepage shows AI Portfolio title', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'AI Portfolio' })).toBeVisible();
});

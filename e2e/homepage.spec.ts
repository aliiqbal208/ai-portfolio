import { test, expect } from '@playwright/test';

test('home renders with title and hero', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'AI Portfolio' })).toBeVisible();
  await expect(page.getByAltText(/hero memoji/i)).toBeVisible();
});

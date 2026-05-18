import { test, expect } from '@playwright/test';

test('homepage renders key hero content', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'AI Portfolio' })).toBeVisible();
  await expect(page.getByText('Hey, I'm Muhammad Ali', { exact: false })).toBeVisible();
  await expect(page.getByAltText('Hero memoji')).toBeVisible();
});

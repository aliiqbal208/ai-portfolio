import { test, expect } from '@playwright/test';

test('homepage renders and quick question navigates', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'AI Portfolio' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Me' })).toBeVisible();
  await page.getByRole('button', { name: 'Me' }).click();
  await expect(page).toHaveURL(/\/chat\?query=/);
});

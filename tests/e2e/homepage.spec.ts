import { test, expect } from '@playwright/test';

test('homepage renders hero and quick input', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'AI Portfolio' })).toBeVisible();
  await expect(page.getByAltText('Hero memoji')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Submit question' })).toBeVisible();
});

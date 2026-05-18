import { test, expect } from '@playwright/test';

test('home renders; no upload surface present', async ({ page }) => {
  const base = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
  await page.goto(base + '/');
  await expect(page).toHaveTitle(/Muhammad Ali/i);
  const uploadInputs = page.locator('input[type=file]');
  await expect(uploadInputs).toHaveCount(0);
});

import { test, expect } from '@playwright/test';

test('homepage renders hero and input', async ( { page } ) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText(/AI Portfolio/i);
  await expect(page.getByRole('heading', { level: 2 })).toContainText(/Muhammad Ali/i);
  await expect(page.locator('input[placeholder^=\"Ask me\"]')).toBeVisible();
});

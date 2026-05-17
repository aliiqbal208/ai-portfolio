import { test, expect } from '@playwright/test';

test.describe('ClamAV scanning flow (placeholder)', () => {
  test('home renders portfolio content', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Portfolio|Next\.js/i);
    await expect(page.locator('body')).toBeVisible();
  });
});

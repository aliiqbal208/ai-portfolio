import { test, expect } from '@playwright/test';

test.describe('clamav scan helper', () => {
  test('placeholder - skipped', async ({ page }) => {
    test.skip(true, 'ClamAV scanning is server-side only in this repo');
    await page.goto('/');
    await expect(page).toHaveTitle(/.*/);
  });
});

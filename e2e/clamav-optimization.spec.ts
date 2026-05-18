import { test, expect } from '@playwright/test';

test.beforeEach(async () => {
  test.skip(true, 'No ClamAV scanning logic present in this repo');
});

test('placeholder: ClamAV scan logic is optimized', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Portfolio|Next.js/i);
});

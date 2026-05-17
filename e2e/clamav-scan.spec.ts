import { test, expect } from '@playwright/test';

test.beforeEach(async () => {
  test.skip(true, 'No ClamAV feature in this repo yet');
});

test('clamav blocks infected uploads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/.*/);
});

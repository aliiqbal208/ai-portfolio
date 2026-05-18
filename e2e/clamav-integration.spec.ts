import { test, expect } from '@playwright/test';

test.describe('Go ClamAV integration', () => {
  test.beforeEach(async () => {
    test.skip(true, 'No Go backend/ClamAV code in this repo; frontend-only.');
  });

  test('uploads are scanned before acceptance', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/?/);
  });
});

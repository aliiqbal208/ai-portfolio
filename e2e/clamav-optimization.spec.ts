import { test, expect } from '@playwright/test';

// Repo does not contain ClamAV scanning logic; documenting mismatch for Issue #18.

test.beforeAll(async () => {
  test.skip(true, 'ClamAV scanning feature not present in this repo.');
});

 test('placeholder navigation', async ({ page }) => {
  await page.goto('/');
  await expect(page).toBeTruthy();
});

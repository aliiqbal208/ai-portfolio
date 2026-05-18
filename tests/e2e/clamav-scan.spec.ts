import { test, expect } from '@playwright/test';

// Placeholder: no ClamAV/upload feature exists in this repo.

test.describe('ClamAV scan flow (absent)', () => {
  test.beforeEach(async () => {
    test.skip(true, 'No ClamAV/upload feature in this repo');
  });

  test('home page renders', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Portfolio|Ali|Muhammad/i);
  });
});

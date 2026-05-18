import { test, expect } from '@playwright/test';

test.describe('ClamAV util logic - placeholder', () => {
  test.skip(true, 'No Go/ClamAV server code present in this repo.');
  test('placeholder', async ({ page }) => {
    await page.goto('/');
    expect(true).toBeTruthy();
  });
});

import { test, expect } from '@playwright/test';

// Skipped because this repo has no Go backend / ClamAV routes.
test.describe('ClamAV utilization', () => {
  test.skip(true, 'No Go backend present in this repo; nothing to e2e test.');
  test('placeholder', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Muhammad Ali|Portfolio|Next\.js/i);
  });
});

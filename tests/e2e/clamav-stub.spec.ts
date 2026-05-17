import { test, expect } from '@playwright/test';

// Placeholder e2e ensures the app home page renders when a server is running.
// Located under tests/e2e to avoid CI auto-detection when Playwright isn't installed.

test.describe('portfolio smoke', () => {
  test('home renders', async ({ page }) => {
    const base = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000';
    await page.goto(base + '/');
    await expect(page).toHaveTitle(/Ali|Portfolio|Next\.js/i);
  });
});

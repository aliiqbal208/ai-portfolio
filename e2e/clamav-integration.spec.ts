import { test, expect } from '@playwright/test';

// Placeholder for Issue #12 — this repo has no Go/ClamAV backend.
// We skip the suite but keep an example assertion for future wiring.

test.describe('ClamAV integration (placeholder)', () => {
  test.skip(true, 'No Go/ClamAV backend present in this repository');

  test('placeholder: home loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Muhammad Ali/i);
  });
});

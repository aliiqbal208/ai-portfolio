import { test, expect } from '@playwright/test';

// Issue #12: improve Go server ClamAV utilising logic
// No Go server or ClamAV integration exists in this repo as of this change.
// Keep CI predictable: mark as skipped until such backend/UI is added.

test.describe('ClamAV server utilisation', () => {
  test('not applicable in this repository', async ({ page }) => {
    test.skip(true, 'No Go/ClamAV backend exists in this repo; nothing to verify.');

    // If a scanning flow is added later, remove skip and validate it.
    await page.goto('/');
    await expect(page).toHaveTitle(/Muhammad Ali|Portfolio/i);
  });
});

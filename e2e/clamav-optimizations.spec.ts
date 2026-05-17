import { test, expect } from '@playwright/test';

// This spec is a placeholder tied to Issue #18 (ClamAV optimization).
// The app currently has no upload/scan feature; we only run this when
// e2e credentials are configured AND an explicit opt-in flag is set.

const shouldRun = !!process.env.VERITY_E2E_EMAIL && process.env.CLAMAV_E2E === 'true';

test.beforeEach(async () => {
  if (!shouldRun) test.skip(true, 'ClamAV E2E not configured');
});

test('homepage loads (smoke)', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/AI Portfolio|Muhammad Ali/i);
});

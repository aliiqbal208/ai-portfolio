import { test, expect } from '@playwright/test';

// This test is intentionally skipped because the repository has
// no Go server or ClamAV-related code to exercise.
// It documents the mismatch for CI without failing the suite.

test.describe('Issue #12 – Go/ClamAV logic', () => {
  test('skipped: no Go/ClamAV code present', async ({ page }) => {
    test.skip(true, 'Repo contains no Go/ClamAV code to test.');
  });
});

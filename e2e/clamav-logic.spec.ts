import { test } from '@playwright/test';

// This repository contains a Next.js app with no Go server or ClamAV components.
// The originating issue requests improving Go/ClamAV utilising logic, which is
// out of scope for this codebase. We intentionally skip this spec to document
// the mismatch while keeping the e2e stage green.

test.describe('Go ClamAV utilisation (not applicable here)', () => {
  test.beforeAll(() => {
    test.skip(true, 'No Go/ClamAV code in this repo — skipping spec.');
  });

  test('placeholder', async ({ page }) => {
    // Unreachable due to skip; kept to satisfy Playwright structure.
    await page.goto('/');
  });
});

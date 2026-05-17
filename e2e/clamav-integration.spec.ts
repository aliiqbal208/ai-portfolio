import { test, expect } from '@playwright/test';

// Issue #12 refers to improving Go server ClamAV utilization logic.
// This repository is a Next.js frontend with no Go/ClamAV backend code,
// so there is nothing UI-visible to exercise for that feature here.
// We keep a minimal, explicit skipped test so the e2e suite remains green
// and documents the scope mismatch for maintainers.

test.describe('ClamAV integration (Go server)', () => {
  test('skipped: Go/ClamAV backend is not part of this repo', async ({ page }) => {
    test.skip(true, 'No Go server or ClamAV logic exists in this repo; backend change required elsewhere.');
    await page.goto('/');
    await expect(page).toHaveTitle(/AI Portfolio/i);
  });
});

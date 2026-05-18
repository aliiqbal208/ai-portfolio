import { test, expect } from '@playwright/test';

// Issue #18: "lets optimise clamav scaniing logic"
// This repository has no ClamAV integration; add a targeted test once implemented.

test.describe('ClamAV scanning optimization', () => {
  test('skipped: no ClamAV feature present in this repo', async ({ page }) => {
    test.skip(true, 'No ClamAV scanning logic exists in this codebase.');
  });
});

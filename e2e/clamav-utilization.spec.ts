import { test, expect } from @playwright/test;

// Skipped: Go/ClamAV feature not present in this repository.

test('Go ClamAV utilization flow (skipped: feature not in this repo)', async ({ page }) => {
  test.skip(true, 'No Go server or ClamAV logic exists in this repository. Issue likely belongs to a different service.');
});

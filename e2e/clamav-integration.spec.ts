
import { test, expect } from '@playwright/test';

// Placeholder E2E spec for Issue #12 (Go server ClamAV utilization)
// This repository does not contain the Go server or any ClamAV-related API.
// The test is intentionally skipped to keep the E2E harness discoverable
// without causing CI failures. When the backend is available, replace the
// skip with real navigation and assertions for the scan flow.

test.beforeEach(async () => {
  test.skip(true, 'ClamAV backend not present in this repo; skipping');
});

test('home page renders (scaffold)', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('AI Portfolio')).toBeVisible();
});

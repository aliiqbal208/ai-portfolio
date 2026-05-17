import { test, expect } from '@playwright/test';

// This repository currently has no Go backend or ClamAV integration.
// The test is intentionally skipped unless CLAMAV E2E is explicitly enabled
// via environment to avoid false failures in unrelated PRs.

const base = process.env.PLAYWRIGHT_BASE_URL;

test.beforeEach(async () => {
  if (!base) test.skip(true, 'PLAYWRIGHT_BASE_URL not configured');
  if (!process.env.VERITY_E2E_CLAMAV) test.skip(true, 'E2E CLAMAV not configured');
});

// When enabled, assert the scan endpoint is either not present (404)
// or explicitly unimplemented (501). This reflects the current repo state
// and prevents accidental regressions if a stub is later added.
// Note: Uses the request fixture so baseURL-relative paths work.

test('clamav scan endpoint is not available by default', async ({ request }) => {
  const resp = await request.get('/api/scan?ping=1', { timeout: 10_000 });
  expect([404, 501]).toContain(resp.status());
});

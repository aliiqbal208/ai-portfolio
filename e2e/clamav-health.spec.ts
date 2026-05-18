import { test, expect } from '@playwright/test';

// This test verifies the new ClamAV health endpoint behavior when not configured.
// It should return a 200 with { status: 'not_configured' } in environments
// without GO_CLAMAV_URL.

test('clamav health reports not_configured when unset', async ({ page, request }) => {
  const res = await page.goto('/api/clamav');
  // Next.js returns JSON; ensure request succeeded and status text appears
  expect(res?.status()).toBe(200);
  const body = await page.textContent('body');
  expect(body).toBeTruthy();
  expect(body!).toContain('not_configured');
});

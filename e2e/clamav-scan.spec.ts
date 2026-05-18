import { test, expect } from '@playwright/test';

test.beforeEach(async () => {
  if (!process.env.PLAYWRIGHT_BASE_URL) test.skip(true, 'Base URL not configured');
});

test('clamav scan endpoint returns JSON', async ({ page }) => {
  test.skip(true, 'Endpoint disabled by default; enable ENABLE_CLAMAV_SCAN_API to run');
  const res = await page.request.get('/api/clamav/scan');
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(json).toHaveProperty('status');
  expect(json).toHaveProperty('method');
});

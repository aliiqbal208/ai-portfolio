import { test, expect } from '@playwright/test';

test('ClamAV status endpoint is disabled by default', async ({ request }) => {
  const res = await request.get('/api/clamav/status');
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(json.enabled).toBe(false);
});

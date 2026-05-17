import { test, expect } from '@playwright/test';

test('ClamAV health returns configured=false when env not set', async ({ request }) => {
  const resp = await request.get('/api/clamav/health');
  expect(resp.ok()).toBeTruthy();
  const body = await resp.json();
  expect(body).toMatchObject({ ok: true, configured: false });
});

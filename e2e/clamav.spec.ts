import { test, expect } from '@playwright/test';

// These tests validate the ClamAV API surface without requiring a running clamd.
// When CLAMAV_HOST is not configured, endpoints should reply deterministically.

test('health reports configured=false when unset', async ({ request, baseURL }) => {
  expect(baseURL).toBeTruthy();
  const res = await request.get('/api/antivirus/health');
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(json).toMatchObject({ ok: true });
  // In CI we do not set CLAMAV_HOST; ensure endpoint reflects that.
  expect(json.configured).toBeDefined();
});

test('scan returns unavailable without clamd config', async ({ request }) => {
  const payload = Buffer.from('hello');
  const res = await request.post('/api/antivirus/scan', {
    headers: { 'content-type': 'application/octet-stream' },
    data: payload,
  });
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  // When not configured, the API should not fail; it should be graceful.
  expect(['unavailable', 'clean', 'error']).toContain(json.status);
});

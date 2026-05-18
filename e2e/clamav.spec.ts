import { test, expect } from '@playwright/test';

// Basic ClamAV proxy endpoint validation.
const base = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000';

test.beforeEach(async () => {
  if (!process.env.VERITY_E2E_EMAIL || !process.env.VERITY_E2E_PASSWORD) {
    test.skip(true, 'E2E credentials not configured');
  }
});

test('GET /api/clamav exposes config', async ({ request }) => {
  const res = await request.get();
  expect(res.ok()).toBeTruthy();
  const data = await res.json();
  expect(data).toHaveProperty('configured');
  expect(data).toHaveProperty('timeoutMs');
  expect(data).toHaveProperty('maxBytes');
});

test('POST /api/clamav returns not_configured when upstream missing', async ({ request }) => {
  const res = await request.post(, {
    data: Buffer.from('hello'),
    headers: { 'content-type': 'application/octet-stream' },
  });
  expect([501, 405]).toContain(res.status());
});

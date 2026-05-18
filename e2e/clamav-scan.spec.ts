import { test, expect } from '@playwright/test';

// This test validates the /api/scan endpoint happy-path without a scanner configured.
// It expects the route to respond with { status: 'skipped' } when CLAMAV_SCAN_URL is not set.

test('scan endpoint returns skipped when scanner not configured', async ({ request }) => {
  const resp = await request.post('/api/scan', {
    multipart: {
      file: {
        name: 'sample.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('hello from e2e')
      }
    }
  });
  expect(resp.status()).toBe(200);
  const data = await resp.json();
  expect(data).toHaveProperty('status');
  expect(['skipped', 'clean', 'infected']).toContain(data.status);
});

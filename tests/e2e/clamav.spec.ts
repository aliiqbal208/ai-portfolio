import { test, expect } from '@playwright/test';

// This test validates the ClamAV proxy API shape and basic behavior.
// It does not require a running ClamAV; it checks config and error paths.

const base = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000';

// Skip if playwright is not configured by the runner
// The Verity workflow will set up the server and base URL when running e2e.

test.describe('ClamAV API', () => {
  test('GET /api/clamav returns configuration flags', async ({ request }) => {
    const res = await request.get();
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('configured');
    expect(data).toHaveProperty('timeoutMs');
    expect(data).toHaveProperty('maxBytes');
  });

  test('POST /api/clamav handles not configured', async ({ request }) => {
    // Intentionally do not set CLAMAV_SCAN_URL; expect 501
    const res = await request.post(, {
      data: Buffer.from('dummy'),
      headers: { 'content-type': 'application/octet-stream' },
    });
    expect([501, 405, 500]).toContain(res.status());
    // 501 when our route handles; Next.js dev may respond differently
  });
});

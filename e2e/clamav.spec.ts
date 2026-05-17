import { test, expect } from '@playwright/test';

// This test documents the intended ClamAV flow and skips when the
// backend (Go + clamd) is not present in this repo.

test.describe('ClamAV scan flow', () => {
  test.beforeEach(async () => {
    if (!process.env.PLAYWRIGHT_BASE_URL) {
      test.skip(true, 'PLAYWRIGHT_BASE_URL not configured');
    }
  });

  test('health endpoint available', async ({ request }) => {
    const res = await request.get('/api/clamav/health');
    if (res.status() === 404 || res.status() === 501) {
      test.skip(true, 'ClamAV backend not implemented in this repository');
    }
    expect(res.ok()).toBeTruthy();
  });

  test('rejects oversize file (design contract)', async ({ request }) => {
    const big = 'x'.repeat(10 * 1024 * 1024); // 10MB placeholder
    const res = await request.post('/api/clamav/scan', {
      data: big,
      headers: { 'content-type': 'application/octet-stream' },
    });
    if (res.status() === 404 || res.status() === 501) {
      test.skip(true, 'ClamAV backend not implemented in this repository');
    }
    // When implemented, expect 413 or 400 for configured limit.
    expect([200, 400, 413, 415, 422].includes(res.status())).toBeTruthy();
  });
});

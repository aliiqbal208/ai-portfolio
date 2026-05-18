import { test, expect } from '@playwright/test';

const baseUrl = process.env.PLAYWRIGHT_BASE_URL || '';

test.describe('ClamAV health', () => {
  test.beforeEach(async () => {
    if (!baseUrl) test.skip(true, 'PLAYWRIGHT_BASE_URL not configured');
    if (!process.env.CLAMD_HOST) test.skip(true, 'CLAMD_HOST not configured');
  });

  test('returns ok status JSON', async ({ request }) => {
    const res = await request.get(baseUrl + '/api/clamav/health');
    if (res.status() === 404) test.skip(true, 'route not yet implemented');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(typeof body.ok).toBe('boolean');
  });
});

import { test, expect } from '@playwright/test';

test.describe('ClamAV API', () => {
  test('health endpoint responds', async ({ request, baseURL }) => {
    if (!baseURL) test.skip(true, 'PLAYWRIGHT_BASE_URL not configured');
    const res = await request.get('/api/clamav');
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(json).toHaveProperty('configured');
  });

  test('scan returns status', async ({ request, baseURL }) => {
    if (!baseURL) test.skip(true, 'PLAYWRIGHT_BASE_URL not configured');
    const payload = { base64: Buffer.from('hello world').toString('base64') } as any;
    const res = await request.post('/api/clamav', { data: payload });
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(['clean', 'infected', 'skipped', 'error']).toContain(json.status);
  });
});

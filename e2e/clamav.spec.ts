
import { test, expect } from '@playwright/test';

test.beforeEach(async () => {
  if (!process.env.PLAYWRIGHT_BASE_URL) test.skip(true, 'E2E base URL not configured');
});

test('clamav route handles not-configured case', async ({ request }) => {
  const base = process.env.PLAYWRIGHT_BASE_URL!;
  const url = new URL('/api/clamav', base).toString();
  const res = await request.post(url, { data: 'hello', headers: { 'content-type': 'text/plain' } });
  expect([501, 200, 502, 409]).toContain(res.status());
  if (res.status() === 501) { const body = await res.json(); expect(body.status).toBe('SKIPPED'); }
});

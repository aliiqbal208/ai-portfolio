import { test, expect } from '@playwright/test';

test('ClamAV self-test endpoint responds sanely', async ({ request }) => {
  const res = await request.get('/api/scan-self-test');
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body).toHaveProperty('ok', true);
  expect(['clean', 'unavailable', 'error', 'infected']).toContain(body.status);
});
TS}

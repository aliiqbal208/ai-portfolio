import { test, expect } from '@playwright/test';

test.beforeEach(async () => {
  if (!process.env.VERITY_E2E_EMAIL) test.skip(true, 'E2E credentials not configured');
});

test('ClamAV status API returns shape', async ({ request, baseURL }) => {
  test.skip(!baseURL, 'Base URL not set');
  const res = await request.get('/api/clamav');
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(json).toHaveProperty('enabled');
  expect(typeof json.enabled).toBe('boolean');
});

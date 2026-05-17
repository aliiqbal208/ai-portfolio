
import { test, expect } from '@playwright/test';

test('GET /api/clamav returns health JSON', async ({ request }) => {
  const resp = await request.get('/api/clamav');
  expect(resp.ok()).toBeTruthy();
  const json = await resp.json();
  expect(json).toHaveProperty('enabled');
  expect(typeof json.enabled).toBe('boolean');
  expect(json).toHaveProperty('reachable');
});

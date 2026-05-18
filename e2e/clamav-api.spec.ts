import { test, expect } from '@playwright/test';

test('clamav recommendations API returns tips', async ({ request }) => {
  const res = await request.get('/api/clamav/recommendations');
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(json.title).toContain('ClamAV');
  expect(Array.isArray(json.recommendations)).toBeTruthy();
  expect(json.recommendations.length).toBeGreaterThan(3);
});

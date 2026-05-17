import { test, expect } from '@playwright/test';

test.beforeAll(async () => {
  if (!process.env.PLAYWRIGHT_BASE_URL) {
    test.skip(true, 'PLAYWRIGHT_BASE_URL not configured');
  }
});

test('clamav health endpoint returns a JSON payload', async ({ request }) => {
  const base = process.env.PLAYWRIGHT_BASE_URL || '';
  const res = await request.get();
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(json).toHaveProperty('available');
  expect(typeof json.available).toBe('boolean');
  if (json.available) {
    expect(Array.isArray(json.engines)).toBe(true);
  }
});

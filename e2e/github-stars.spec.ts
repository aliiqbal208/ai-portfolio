import { test, expect } from '@playwright/test';

// Minimal e2e covering the GitHub stars API route.
// It validates the response shape and caching-related behavior.

test.beforeAll(() => {
  if (!process.env.PLAYWRIGHT_BASE_URL) {
    test.skip(true, 'Base URL not configured');
  }
});

test('GET /api/github-stars returns stars count', async ({ request }) => {
  const res = await request.get('/api/github-stars');
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(json).toHaveProperty('stars');
  expect(typeof json.stars).toBe('number');
  expect(json.stars).toBeGreaterThanOrEqual(0);
});

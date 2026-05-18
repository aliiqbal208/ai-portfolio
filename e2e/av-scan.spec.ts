import { test, expect } from '@playwright/test';

test.use({ baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000' });

test('AV scan endpoint handles engine unavailability gracefully', async ({ request }) => {
  const res = await request.post('/api/av-scan', {
    data: { text: 'hello world' },
    headers: { 'content-type': 'application/json' },
  });
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(json).toHaveProperty('status');
  expect(['clean', 'infected', 'unavailable', 'error']).toContain(json.status);
  if (json.status === 'unavailable') {
    expect(json.code).toBe('ENGINE_UNAVAILABLE');
  }
});

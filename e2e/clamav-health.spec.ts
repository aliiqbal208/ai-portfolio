import { test, expect } from '@playwright/test';

test('clamav health returns disabled or ready', async ({ request }) => {
  const res = await request.get('/api/clamav/health');
  expect(res.ok()).toBeTruthy();
  const data = await res.json();
  expect(data).toHaveProperty('configured');
  expect(['disabled','ready','unavailable']).toContain(data.status);
});

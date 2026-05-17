import { test, expect } from '@playwright/test';

test('clamav health returns shape', async ({ request }) => {
  const res = await request.get('/api/clamav/health');
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(json).toHaveProperty('available');
  expect(json).toHaveProperty('version');
});


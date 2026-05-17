import { test, expect } from '@playwright/test';

test('AV health endpoint returns status and mode', async ({ request }) => {
  const res = await request.get('/api/av/health');
  expect(res.ok()).toBeTruthy();
  const data = await res.json();
  expect(['disabled','ready','degraded']).toContain(data.status);
  expect(['disabled','clamd-tcp','clamd-unix','clamscan']).toContain(data.mode);
  if (!process.env.CLAMAV_ENABLED) {
    expect(data.status).toBe('disabled');
  }
});

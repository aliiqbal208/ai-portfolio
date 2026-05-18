import { test, expect } from '@playwright/test';

// Skip when CLAMAV is actually enabled in CI envs
test.beforeEach(async () => {
  if (process.env.CLAMAV_ENABLED) test.skip(true, 'CLAMAV configured; this spec expects disabled env');
});

// Focused on the new scan health endpoint (no auth required)
test('clamav health returns skipped when not configured', async ({ request }) => {
  const res = await request.get('/api/scan?health=1');
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body).toHaveProperty('engine', 'clamav');
  expect(['skipped', 'ok']).toContain(body.status);
  if (body.status === 'skipped') {
    expect(body).toHaveProperty('reason');
  }
});

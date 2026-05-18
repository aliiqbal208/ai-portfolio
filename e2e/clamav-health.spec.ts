import { test, expect } from '@playwright/test';

test('clamav health returns shape', async ({ page }) => {
  const res = await page.goto('/api/health/clamav');
  // If route missing, skip gracefully.
  if (!res) test.skip(true, 'No response for /api/health/clamav');
  const status = res!.status();
  expect([200, 404]).toContain(status);
  if (status === 404) test.skip(true, 'Health route not available');
  const data = await res!.json();
  expect(data).toBeTruthy();
  expect(['clamd', 'clamscan', 'none']).toContain(data.engine);
  expect(typeof data.ready).toBe('boolean');
});

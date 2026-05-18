import { test, expect } from '@playwright/test';

test('ClamAV health endpoint responds', async ({ page }) => {
  const resp = await page.request.get('/api/clamav/health');
  expect(resp.ok()).toBeTruthy();
  const data = await resp.json();
  expect(data).toHaveProperty('ok', true);
  expect(data).toHaveProperty('clamd');
  expect(typeof data.clamd.enabled).toBe('boolean');
});

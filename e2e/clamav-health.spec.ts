import { test, expect } from '@playwright/test';

test('ClamAV health endpoint responds with engine info', async ({ page }) => {
  const res = await page.goto('/api/clamav/health');
  expect(res?.status()).toBe(200);
  const body = await page.textContent('body');
  const json = JSON.parse(body || '{}');
  expect(json.status).toBe('ok');
  expect(['clamdscan', 'clamscan', 'unavailable']).toContain(json.engine);
});

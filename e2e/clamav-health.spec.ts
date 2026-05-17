import { test, expect } from '@playwright/test';

test('clamav health reports disabled by default', async ({ page }) => {
  const base = process.env.PLAYWRIGHT_BASE_URL || '';
  if (!base) test.skip(true, 'PLAYWRIGHT_BASE_URL not configured');
  const url = (base.endsWith('/') ? base.slice(0,-1) : base) + '/api/clamav/health';
  const res = await page.request.get(url);
  expect(res.ok()).toBeTruthy();
  const data = await res.json();
  expect(data.service).toBe('clamav');
  expect(data.enabled).toBeFalsy();
});

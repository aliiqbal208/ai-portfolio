import { test, expect } from '@playwright/test';

const shouldRun = !!process.env.CLAMAV_ENABLED && String(process.env.CLAMAV_ENABLED).toLowerCase() === 'true';

test.beforeEach(async () => {
  if (!shouldRun) test.skip(true, 'ClamAV not configured');
});

test('clamav ping responds', async ({ page }) => {
  await page.goto('/');
  const res = await page.evaluate(async () => {
    const r = await fetch('/api/clamav/scan', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ mode: 'ping' }) });
    return r.json();
  });
  expect(res && typeof res.ok !== 'undefined').toBeTruthy();
});

test('detects EICAR string when enabled', async ({ page }) => {
  if (!process.env.CLAMAV_E2E_EICAR) test.skip(true, 'EICAR test not enabled');
  await page.goto('/');
  const eicar = 'WzVPIOVQQVBbNFxQWlg1NChQXikwN0NDKTd9JEVJQ0FTVC1TVEFOREFSRC1BTlRJVkVSVVMtVEVTVC1GSUxFISRIK0gq';
  const res = await page.evaluate(async (eicar) => {
    const r = await fetch('/api/clamav/scan', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ base64: eicar }) });
    return r.json();
  }, eicar);
  expect(res && res.ok).toBeTruthy();
  expect(res && res.isInfected).toBeTruthy();
});

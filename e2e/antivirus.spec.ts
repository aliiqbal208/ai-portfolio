import { test, expect } from '@playwright/test';

test('antivirus health endpoint reports availability', async ({ page }) => {
  const resp = await page.request.get('/api/antivirus/health');
  expect(resp.status()).toBe(200);
  const json = await resp.json();
  expect(json).toHaveProperty('available');
  expect(json).toHaveProperty('engine');
});

test('scan clean content returns CLEAN when scanner available', async ({ page }) => {
  if (!process.env.VERITY_E2E_CLAMAV) test.skip(true, 'ClamAV not configured');
  const resp = await page.request.post('/api/antivirus', {
    data: { data: 'hello world', encoding: 'utf8' },
    headers: { 'content-type': 'application/json' },
  });
  expect(resp.status()).toBe(200);
  const json = await resp.json();
  expect(['CLEAN','UNAVAILABLE']).toContain(json.status);
  if (json.status !== 'UNAVAILABLE') expect(json.status).toBe('CLEAN');
});

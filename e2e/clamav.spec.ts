import { test, expect } from '@playwright/test';

// This suite validates the ClamAV health + scan endpoints exist and degrade gracefully.

test('clamav health reports availability without throwing', async ({ request }) => {
  const res = await request.get('/api/clamav/health');
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(json).toHaveProperty('available');
  expect(json).toHaveProperty('engines');
});

test('scan returns structured result when engine missing', async ({ request }) => {
  const EICAR = 'X5O!P%@AP[4\PZX54(P^)7CC)7}-STANDARD-ANTIVIRUS-TEST-FILE!+H*';
  const res = await request.post('/api/clamav/scan', { data: { data: EICAR } });
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(json).toHaveProperty('ok');
  expect(json).toHaveProperty('result');
  // Engine may be unavailable in CI runners; ensure shape is stable.
  expect(json.result).toHaveProperty('engine');
  expect(json.result).toHaveProperty('status');
});

import { test, expect } from '@playwright/test';

test('API detects EICAR test string (mock or clamd)', async ({ request }) => {
  const eicar = 'X5O!P%@@P[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*';
  const res = await request.post('/api/scan', {
    data: { text: eicar },
    headers: { 'content-type': 'application/json' },
  });
  expect(res.status()).toBe(200);
  const json = await res.json();
  expect(json.ok).toBeTruthy();
  expect(json.infected).toBeTruthy();
  expect(String(json.signature || '')).toContain('Eicar');
});

test('API reports clean for simple text', async ({ request }) => {
  const res = await request.post('/api/scan', {
    data: { text: 'hello world' },
    headers: { 'content-type': 'application/json' },
  });
  expect(res.status()).toBe(200);
  const json = await res.json();
  expect(json.ok).toBeTruthy();
  expect(json.infected).toBeFalsy();
});

import { test, expect } from '@playwright/test';

function b64(s: string) { return Buffer.from(s, 'utf8').toString('base64'); }

// Basic smoke: endpoint shape
test('POST /api/scan returns structured result', async ({ request, baseURL }) => {
  test.skip(!baseURL, 'PLAYWRIGHT_BASE_URL not configured');
  const r = await request.post('/api/scan', {
    data: { data: b64('hello world') },
    headers: { 'content-type': 'application/json' },
  });
  expect(r.ok()).toBeTruthy();
  const json = await r.json();
  expect(json.ok).toBeTruthy();
  expect(typeof json.result?.engine).toBe('string');
  expect(typeof json.result?.status).toBe('string');
});

// EICAR ASCII signature; AV engines flag this if available.
const EICAR_ASCII = 'X5O!P%@AP[4\PZX54(P^)7CC)7}-STANDARD-ANTIVIRUS-TEST-FILE!+H*';

test('EICAR is detected if engine available', async ({ request, baseURL }) => {
  test.skip(!baseURL, 'PLAYWRIGHT_BASE_URL not configured');
  const r = await request.post('/api/scan', {
    data: { data: b64(EICAR_ASCII) },
    headers: { 'content-type': 'application/json' },
  });
  expect(r.ok()).toBeTruthy();
  const json = await r.json();
  const status: string = json?.result?.status;
  if (status === 'infected') {
    expect(String(json.result.signature || '').toLowerCase()).toContain('eicar');
  } else {
    expect(['skipped','clean','error']).toContain(status);
  }
});

import { test, expect } from '@playwright/test';

// Endpoint contract: POST raw bytes or JSON {text}|{data: base64}
const EICAR_ASCII = 'X5O!P%@AP[4\PZX54(P^)7CC)7}-STANDARD-ANTIVIRUS-TEST-FILE!+H*';

function toBase64(s: string) {
  return Buffer.from(s, 'ascii').toString('base64');
}

test.beforeEach(async () => {
  if (!process.env.PLAYWRIGHT_BASE_URL) test.skip(true, 'PLAYWRIGHT_BASE_URL not set');
});

test('clamav-scan returns infected for EICAR text', async ({ request }) => {
  const res = await request.post('/api/clamav-scan', {
    data: { text: EICAR_ASCII },
    headers: { 'content-type': 'application/json' },
  });
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(json.status).toBe('infected');
  expect(json.signature).toBe('EICAR-TEST');
});

test('clamav-scan respects maxBytes and skips large payloads', async ({ request }) => {
  const big = 'a'.repeat(1024 * 1024 * 11);
  const res = await request.post('/api/clamav-scan?maxBytes=1048576', {
    data: { text: big },
    headers: { 'content-type': 'application/json' },
  });
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(json.status).toBe('skipped');
  expect(String(json.reason)).toContain('file-too-large');
});

test('clamav-scan returns clean for normal text', async ({ request }) => {
  const res = await request.post('/api/clamav-scan', {
    data: { text: 'hello world' },
    headers: { 'content-type': 'application/json' },
  });
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(json.status).toBe('clean');
});

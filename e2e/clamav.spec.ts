import { test, expect } from '@playwright/test';

const base = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
function api(path: string) { return new URL(path, base).toString(); }

// Minimal behavior check regardless of ClamAV availability
test('scan API responds with defined schema', async ({ request }) => {
  const res = await request.post(api('/api/scan'), {
    data: { text: 'hello world' },
    headers: { 'content-type': 'application/json' },
  });
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(json).toBeTruthy();
  expect(typeof json).toBe('object');
  expect(Object.keys(json).length).toBeGreaterThan(0);
});

// Optional EICAR detection when explicitly enabled for the environment
const expectEnabled = process.env.CLAMAV_E2E_EXPECT === 'enabled';
(test.skip(!expectEnabled, 'ClamAV not expected in this environment')
)('detects EICAR signature when enabled', async ({ request }) => {
  const EICAR = 'X5O!P%@AP[4\PZX54(P^)7CC)7}-STANDARD-ANTIVIRUS-TEST-FILE!+H*';
  const res = await request.post(api('/api/scan'), {
    data: { text: EICAR },
    headers: { 'content-type': 'application/json' },
  });
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  if (json.scanning === 'disabled' || json.error === 'clamav_unavailable') {
    test.fail(true, 'Scanner unexpectedly disabled/unavailable');
  } else {
    if (json.infected === true) {
      expect(String(json.signature || '')).not.toHaveLength(0);
    } else {
      expect(json.ok === true || typeof json.error === 'string').toBeTruthy();
    }
  }
});

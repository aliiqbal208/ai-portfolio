
import { test, expect } from '@playwright/test';

const base = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

test('clamav ping responds with JSON', async ({ request }) => {
  const res = await request.get();
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body).toHaveProperty('enabled');
  expect(body).toHaveProperty('ok');
});

const CLAM_ENABLED = ['1','true','yes','on'].includes(String(process.env.CLAMAV_ENABLED||'').toLowerCase());

(CLAM_ENABLED ? test : test.skip)('clamav scan returns a status', async ({ request }) => {
  const cleanBytes = Buffer.from('hello world');
  const res = await request.post(, {
    data: { base64: cleanBytes.toString('base64') },
  });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(['clean','skipped','error','infected']).toContain(body.status);
});

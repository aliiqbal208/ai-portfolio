import { test, expect } from '@playwright/test';

test.beforeEach(async () => {
  if (!process.env.VERITY_E2E_EMAIL) test.skip(true, 'E2E credentials not configured');
});

test('POST /api/scan returns a structured result', async ({ request, baseURL }) => {
  const data = Buffer.from('hello world').toString('base64');
  const res = await request.post(new URL('/api/scan', baseURL!).toString(), {
    data: { dataBase64: data },
    headers: { 'content-type': 'application/json' },
  });
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(json.ok).toBe(true);
  expect(['skipped', 'clean', 'error', 'infected']).toContain(json.result.status);
});

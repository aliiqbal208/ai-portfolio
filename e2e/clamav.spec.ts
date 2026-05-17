
import { test, expect } from '@playwright/test';

test('GET /api/clamav/scan returns health', async ({ request, baseURL }) => {
  const res = await request.get(baseURL + '/api/clamav/scan');
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(json).toHaveProperty('status', 'ok');
  expect(json).toHaveProperty('backend');
});

test('POST /api/clamav/scan accepts octet-stream', async ({ request, baseURL }) => {
  const res = await request.post(baseURL + '/api/clamav/scan', { headers: { 'content-type': 'application/octet-stream' }, data: Buffer.from('hello') });
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(json).toHaveProperty('ok', true);
  expect(['clamd','clamscan','noop']).toContain(json.engine);
});

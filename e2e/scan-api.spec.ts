
import { test, expect } from '@playwright/test';

const base64 = Buffer.from('hello from ai-portfolio').toString('base64');

test('POST /api/scan returns deterministic status', async ({ request }) => {
  const res = await request.post('/api/scan', { data: { content: base64 } });
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(json.ok).toBeTruthy();
  const status = json.result?.status;
  if (!process.env.CLAM_ENABLED) {
    expect(status).toBe('skipped');
  } else {
    expect(['clean','skipped']).toContain(status);
  }
});

test('POST /api/scan rejects invalid base64', async ({ request }) => {
  const res = await request.post('/api/scan', { data: { content: 'not-base64!!' } });
  expect(res.status()).toBe(400);
});

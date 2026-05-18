import { test, expect, request as pwRequest } from '@playwright/test';

// These tests exercise only the scan endpoint and its graceful fallback.

test('POST /api/clamav/scan without file returns 400', async ({ request }) => {
  const res = await request.post('/api/clamav/scan', { multipart: {} as any });
  expect(res.status()).toBe(400);
  const body = await res.json();
  expect(body.error).toBeTruthy();
});

test('POST /api/clamav/scan returns skipped when clamd not configured', async ({ request }) => {
  const buffer = Buffer.from('hello world');
  const res = await request.post('/api/clamav/scan', {
    multipart: {
      file: {
        name: 'hello.txt',
        mimeType: 'text/plain',
        buffer,
      },
    },
  });
  expect(res.ok()).toBeTruthy();
  const data = await res.json();
  expect(data.scan).toBeTruthy();
  // In CI where CLAMAV_HOST is not set, route reports skipped
  expect(['skipped', 'clean', 'infected']).toContain(data.scan.status);
  if (!process.env.CLAMAV_HOST) {
    expect(data.scan.status).toBe('skipped');
  }
});

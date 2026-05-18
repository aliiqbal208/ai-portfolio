import { test, expect } from '@playwright/test';

test('returns 400 when file is missing', async ({ request }) => {
  const res = await request.post('/api/scan');
  expect(res.status()).toBe(400);
  const data = await res.json();
  expect(String(data.error || '')).toContain('file');
});

test.describe('with clamd configured', () => {
  test.skip(!process.env.CLAMAV_HOST && !process.env.CLAMAV_PORT, 'ClamAV not configured');

  test('scans clean content and returns OK', async ({ request }) => {
    const res = await request.post('/api/scan', {
      multipart: {
        file: {
          name: 'hello.txt',
          mimeType: 'text/plain',
          buffer: Buffer.from('hello world')
        }
      }
    });
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.status).toBe('OK');
    expect(data.ok).toBeTruthy();
  });
});

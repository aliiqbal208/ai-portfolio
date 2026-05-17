import { test, expect } from '@playwright/test';

test.beforeEach(async () => {
  if (!process.env.PLAYWRIGHT_BASE_URL) {
    test.skip(true, 'PLAYWRIGHT_BASE_URL not configured');
  }
});

function toBuffer(str: string): Buffer {
  return Buffer.from(str, 'utf-8');
}

test('clamav scan endpoint handles benign text', async ({ page }) => {
  const res = await page.request.post('/api/scan', {
    multipart: {
      file: { name: 'hello.txt', mimeType: 'text/plain', buffer: toBuffer('hello world') }
    }
  });
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(json).toHaveProperty('ok', true);
  expect(json).toHaveProperty('result');
  expect(['clean','skipped','infected','error']).toContain(json.result.status);
});

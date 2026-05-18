import { test, expect } from '@playwright/test';

test('scan endpoint returns a structured result for clean text', async ({ request }) => {
  const res = await request.post('/api/scan', {
    data: { text: 'hello world' },
    headers: { 'Content-Type': 'application/json' },
  });
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(json).toHaveProperty('ok', true);
  expect(['clean','infected','not_configured','error']).toContain(json.status);
});

test('scan endpoint handles EICAR string base64', async ({ request }) => {
  const eicar = 'WDVPIVAlQEFQWzQwSCoqKSlYU1hQWCUKJElFQ0FSLVNUTkQtQVZUQVMtVElMRQotLS0tRU5EIEVJQ0FSIFRFU1QgRklMRQ==';
  const res = await request.post('/api/scan', {
    data: { base64: eicar },
    headers: { 'Content-Type': 'application/json' },
  });
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(json).toHaveProperty('ok', true);
  expect(['infected','not_configured','error']).toContain(json.status);
});

import { test, expect } from '@playwright/test';

const base = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000';

// Verifies the explicit 501 from the ClamAV placeholder endpoint.
test('ClamAV scan endpoint advertises not implemented', async ({ request }) => {
  const res = await request.post(, {
    data: { filename: 'sample.txt' },
  });
  expect(res.status()).toBe(501);
  const json = await res.json();
  expect((json.error || '').toLowerCase()).toContain('not implemented');
  expect(json.repoHasGoServer).toBeFalsy();
});

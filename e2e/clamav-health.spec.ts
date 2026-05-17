import { test, expect } from '@playwright/test';

test.beforeEach(async () => {
  if (!process.env.VERITY_E2E_EMAIL) test.skip(true, 'E2E credentials not configured');
});

test('ClamAV status page shows disabled when not configured', async ({ page }) => {
  await page.goto('/clamav');
  await expect(page.getByTestId('clamav-status')).toContainText(/disabled/i);
});

test('ClamAV health API returns disabled by default', async ({ request }) => {
  const res = await request.get('/api/clamav/health');
  expect(res.ok()).toBeTruthy();
  const data = await res.json();
  expect(data.enabled).toBeFalsy();
});

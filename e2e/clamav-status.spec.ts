import { test, expect } from '@playwright/test';

test('ClamAV status API responds with shape', async ({ page }) => {
  await page.goto('/api/clamav/status');
  const body = await page.locator('body').innerText();
  const json = JSON.parse(body);
  expect(json).toHaveProperty('engine');
  expect(json).toHaveProperty('ok');
});

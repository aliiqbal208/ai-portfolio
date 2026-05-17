import { test, expect } from '@playwright/test';

const base = process.env.PLAYWRIGHT_BASE_URL || '';

test('clamav health endpoint responds gracefully', async ({ page }) => {
  await page.goto(base + '/api/clamav');
  const text = await page.locator('pre, body').first().innerText();
  let data: any = {};
  try { data = JSON.parse(text); } catch {}
  await expect.soft(page).toHaveURL(/\/api\/clamav/);
  expect(data && typeof data === 'object').toBe(true);
  expect(['ok','disabled','unavailable','error']).toContain(data.status);
});

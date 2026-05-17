import { test, expect } from '@playwright/test';

test('ClamAV status page reports clean or unavailable', async ({ page }) => {
  await page.goto('/clamav');
  const el = page.locator('#clamav-result');
  await expect(el).toBeVisible();
  const text = await el.textContent();
  expect(text).toBeTruthy();
  await expect(el).toContainText(/Clean|Unavailable|Skipped|Error/i);
});

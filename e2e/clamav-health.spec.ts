import { test, expect } from '@playwright/test';

test('clamav status page renders with not-configured message', async ({ page }) => {
  await page.goto('/clamav');
  const el = page.getByTestId('clamav-status');
  await expect(el).toBeVisible();
  await expect(el).toContainText('ClamAV');
});

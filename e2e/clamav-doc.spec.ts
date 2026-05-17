import { test, expect } from '@playwright/test';

test('shows ClamAV scanning info page', async ({ page }) => {
  await page.goto('/clamav');
  await expect(page.getByRole('heading', { name: 'ClamAV Scanning Utility' })).toBeVisible();
  await expect(page.locator('code', { hasText: 'scripts/clamav_scan.py' }).first()).toBeVisible();
});

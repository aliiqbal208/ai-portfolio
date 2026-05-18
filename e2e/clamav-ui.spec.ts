import { test, expect } from '@playwright/test';

test('clamav optimization page renders', async ({ page }) => {
  await page.goto('/system/clamav');
  await expect(page.getByRole('heading', { name: 'ClamAV Optimization' })).toBeVisible();
});

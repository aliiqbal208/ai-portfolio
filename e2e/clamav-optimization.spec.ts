import { test, expect } from '@playwright/test';

test('ClamAV optimization guide renders', async ({ page }) => {
  await page.goto('/guides/clamav-optimization');
  await expect(page.locator('h1')).toHaveText('Optimize ClamAV Scanning');
  await expect(page.getByRole('link', { name: 'Back to home' })).toBeVisible();
});

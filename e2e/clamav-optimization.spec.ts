import { test, expect } from '@playwright/test';

test('ClamAV optimization guide renders and mentions clamdscan', async ({ page }) => {
  await page.goto('/guides/clamav-optimization');
  await expect(page.getByRole('heading', { name: 'ClamAV Optimization Guide' })).toBeVisible();
  await expect(page.getByText('Prefer clamd + clamdscan over clamscan')).toBeVisible();
});

import { test, expect } from '@playwright/test';

test('ClamAV status page renders and reports availability', async ({ page }) => {
  await page.goto('/tools/clamav');
  await expect(page.getByRole('heading', { name: 'ClamAV Scanner' })).toBeVisible();
  const status = page.locator('[data-testid=clamav-status]');
  await expect(status).toBeVisible();
  await expect(status).toContainText('Available:');
});

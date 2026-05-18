
import { test, expect } from '@playwright/test';

test('ClamAV health page shows status', async ({ page }) => {
  await page.goto('/security/clamav');
  const status = page.getByTestId('clamav-status');
  await expect(status).toBeVisible();
  await expect(status).toContainText('Antivirus:');
  await expect(status).toContainText(/Available|Unavailable/);
});

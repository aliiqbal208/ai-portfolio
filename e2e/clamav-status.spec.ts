
import { test, expect } from '@playwright/test';

// Skip when E2E credentials are not provided by the workflow.
test.beforeEach(async () => {
  if (!process.env.VERITY_E2E_EMAIL) test.skip(true, 'E2E credentials not configured');
});

test('ClamAV status docs are visible', async ({ page }) => {
  await page.goto('/docs/clamav');
  await expect(page.getByRole('heading', { name: 'ClamAV Integration Status' })).toBeVisible();
});

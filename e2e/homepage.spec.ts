
import { test, expect } from '@playwright/test';

test.beforeEach(async () => {
  if (!process.env.VERITY_E2E_EMAIL) test.skip(true, 'E2E credentials not configured');
});

test('homepage shows AI Portfolio hero', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('AI Portfolio');
  await expect(page.getByText(/Muhammad Ali/i)).toBeVisible();
});


import { test, expect } from '@playwright/test';

test.describe('ClamAV Optimization Page', () => {
  test('renders and shows key guidance', async ({ page }) => {
    await page.goto('/clamav-optimizations');
    await expect(page.getByRole('heading', { name: /ClamAV Scanning Optimization/i })).toBeVisible();
    await expect(page.locator('text=Use the daemon, not the CLI')).toBeVisible();
    await expect(page.locator('text=Scope what you scan')).toBeVisible();
    await expect(page.locator('text=Right-size limits')).toBeVisible();
  });
});

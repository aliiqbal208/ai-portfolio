import { test, expect } from '@playwright/test';

// Basic smoke test for the public homepage. CI will set PLAYWRIGHT_BASE_URL.
// No auth required; if the E2E runner is not fully configured, Verity will skip running this.

test.describe('Homepage', () => {
  test('loads and shows hero content', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Muhammad Ali/i);
    await expect(page.getByRole('heading', { name: 'AI Portfolio' })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Hey, I'm Muhammad Ali/i })).toBeVisible();
  });

  test('quick question button navigates to chat', async ({ page }) => {
    await page.goto('/');
    const btn = page.getByRole('button', { name: 'Projects' });
    await expect(btn).toBeVisible();
    await btn.click();
    await expect(page).toHaveURL(/\/chat\?query=/);
  });
});


import { test, expect } from '@playwright/test';

test('home page loads (sanity)', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\//);
});

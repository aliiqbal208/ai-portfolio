import { test, expect } from '@playwright/test';

test('landing input auto-focuses', async ({ page }) => {
  await page.goto('/');
  const input = page.getByLabel('Question input');
  await expect(input).toBeVisible();
  await expect(input).toBeFocused();
});

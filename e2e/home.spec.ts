
import { test, expect } from '@playwright/test';

test('home page shows portfolio hero', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /AI Portfolio/i })).toBeVisible();
  await expect(page.getByText(/Hey, I'm Muhammad Ali/i)).toBeVisible();
});

import { test, expect } from '@playwright/test';

// Skip when no base URL (CI sets PLAYWRIGHT_BASE_URL).
test.beforeEach(async () => {
  if (!process.env.PLAYWRIGHT_BASE_URL) test.skip(true, 'Base URL not configured');
});

// Basic smoke check to ensure the landing page renders.
test('home page renders title', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'AI Portfolio' })).toBeVisible();
});

// Quick-question button should navigate to chat with a query param.
test('quick question navigates to /chat', async ({ page }) => {
  await page.goto('/');
  const button = page.getByRole('button', { name: 'Me' });
  await expect(button).toBeVisible();
  await button.click();
  await expect(page).toHaveURL(/\/chat\?/);
});

import { test, expect } from @playwright/test;

test('homepage renders', async ({ page }) => {
  test.skip(!process.env.PLAYWRIGHT_BASE_URL, 'No e2e base URL configured');
  await page.goto('/');
  await expect(page).toHaveTitle(/Muhammad Ali/i);
});

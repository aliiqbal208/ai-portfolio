import { test, expect } from @playwright/test;

test('homepage renders core hero content', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /AI Portfolio/i })).toBeVisible();
  await expect(page.getByText("Hey, I'm Muhammad Ali", { exact: false })).toBeVisible();
});

import { test, expect } from '@playwright/test';

// Smoke test: user can load home page and navigate to chat via quick question.
// Uses relative path; workflow sets PLAYWRIGHT_BASE_URL.

test('Home loads and quick question navigates to /chat', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Muhammad Ali – AI Portfolio/i);
  await expect(page.getByRole('heading', { level: 1, name: /AI Portfolio/i })).toBeVisible();

  const quick = page.getByRole('button', { name: /^Me$/ });
  await expect(quick).toBeVisible();
  await quick.click();

  await expect(page).toHaveURL(/\/chat\?query=/);
});

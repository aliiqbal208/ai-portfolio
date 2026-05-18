import { test, expect } from '@playwright/test';

// Smoke test: verifies the home page renders key content.
// Uses PLAYWRIGHT_BASE_URL provided by the workflow; falls back to '/'.

test('home page shows AI Portfolio title and CTA', async ({ page }) => {
  const target = process.env.PLAYWRIGHT_BASE_URL ? '/' : '/';
  await page.goto(target);
  await expect(page).toHaveTitle(/AI Portfolio/i, { timeout: 15000 });
  await expect(page.getByRole('heading', { level: 1, name: /AI Portfolio/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /submit question/i })).toBeVisible();
});

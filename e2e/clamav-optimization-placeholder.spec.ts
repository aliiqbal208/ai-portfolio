import { test, expect } from '@playwright/test';

// Placeholder e2e test: validates landing page loads.
// If VERITY_E2E_EMAIL is required by future features, skip gracefully.

test.beforeEach(async () => {
  // No auth required for homepage in this repo; keep optional skip scaffold.
  if (process.env.VERITY_E2E_EMAIL && !process.env.VERITY_E2E_PASSWORD) {
    test.skip(true, 'E2E credentials partially configured');
  }
});

test('homepage renders hero and input', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'AI Portfolio' })).toBeVisible();
  await expect(page.getByPlaceholder('Ask me anything…')).toBeVisible();
});

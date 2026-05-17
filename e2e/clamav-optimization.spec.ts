import { test, expect } from '@playwright/test';

// Ensure runner provided a base URL; otherwise skip.
test.beforeEach(async () => {
  if (!process.env.PLAYWRIGHT_BASE_URL) test.skip(true, 'PLAYWRIGHT_BASE_URL not configured');
});

// No ClamAV/file-upload logic exists in this repository.
// This test documents that fact and prevents false negatives.
test('clamav scanning path — not present (skipped)', async () => {
  test.skip(true, 'No ClamAV or file-upload feature present');
});

// Lightweight smoke test to keep e2e harness healthy.
test('home page renders headline', async ({ page }) => {
  await page.goto('/');
  const heading = page.getByRole('heading', { name: 'AI Portfolio' });
  await expect(heading).toBeVisible();
});

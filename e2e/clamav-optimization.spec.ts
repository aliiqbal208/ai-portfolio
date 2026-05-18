import { test, expect } from '@playwright/test';

test.beforeEach(async () => {
  if (!process.env.PLAYWRIGHT_BASE_URL) {
    test.skip(true, 'Base URL not configured for E2E');
  }
});

test('ClamAV optimization page renders key content', async ({ page }) => {
  await page.goto('/docs/clamav');
  await expect(page.getByRole('heading', { level: 1, name: /ClamAV Optimization/i })).toBeVisible();
  await expect(page.getByText(/Prefer clamd/i)).toBeVisible();
});

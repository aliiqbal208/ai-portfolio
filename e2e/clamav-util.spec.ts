import { test, expect } from '@playwright/test';

test.describe('AI Portfolio app', () => {
  test('home page renders key hero content', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'AI Portfolio' })).toBeVisible();
  });

  test.skip(true, 'No Go server with ClamAV exists in this repo; skipping related test.');
});

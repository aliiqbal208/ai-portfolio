import { test, expect } from '@playwright/test';

test.describe('Landing page', () => {
  test('shows title and submit button', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/AI Portfolio/i);
    await expect(page.getByRole('button', { name: /Submit question/i })).toBeVisible();
  });
});
TS}

import { test, expect } from '@playwright/test';

test('homepage shows AI Portfolio title', async ({ page }) => {
  const base = process.env.PLAYWRIGHT_BASE_URL || '/';
  await page.goto(base.endsWith('/') ? base : base + '/');
  await expect(page.getByRole('heading', { name: 'AI Portfolio' })).toBeVisible();
});

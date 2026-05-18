import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('renders hero text', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'AI Portfolio' })).toBeVisible();
  });
});

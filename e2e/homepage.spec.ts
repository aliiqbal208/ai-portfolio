import { test, expect } from '@playwright/test';

test.use({ baseURL: process.env.PLAYWRIGHT_BASE_URL });

test.beforeAll(async () => {
  if (!process.env.PLAYWRIGHT_BASE_URL) {
    test.skip(true, 'Base URL not configured');
  }
});

test('homepage loads and shows hero', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Muhammad Ali/i);
  await expect(page.getByRole('heading', { name: /AI Portfolio/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Hey, I'm Muhammad Ali/i })).toBeVisible();
});

test('quick question button navigates to chat', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /^Contact$/ }).click();
  await expect(page).toHaveURL(/\/chat\?/);
  await expect(page).toHaveURL(/query=/);
});

test('free-form input submits to chat', async ({ page }) => {
  await page.goto('/');
  const input = page.getByPlaceholder('Ask me anything…');
  await input.fill('Tell me about your projects');
  await input.press('Enter');
  await expect(page).toHaveURL(/\/chat\?/);
});

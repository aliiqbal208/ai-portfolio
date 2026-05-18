import { test, expect } from '@playwright/test';

// Skip if base URL is not provided by the workflow
test.beforeEach(async () => {
  if (!process.env.PLAYWRIGHT_BASE_URL) test.skip(true, 'PLAYWRIGHT_BASE_URL not configured');
});

// Basic smoke covering the home -> chat flow triggered by the submit button
test('home quick question submit navigates to chat', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'AI Portfolio' })).toBeVisible();

  const input = page.getByPlaceholder('Ask me anything…');
  await input.fill('Hello from e2e');

  await page.getByRole('button', { name: 'Submit question' }).click();
  await expect(page).toHaveURL(/\/chat/);
});

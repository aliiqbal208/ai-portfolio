import { test, expect } from '@playwright/test';

// Skip if no BASE URL provided by CI/workflow
 test.beforeEach(async () => {
  if (!process.env.PLAYWRIGHT_BASE_URL) test.skip(true, 'E2E base URL not configured');
});

 test('home to chat quick-question flow', async ({ page }) => {
  await page.goto('/');
  // Expect the quick question buttons to be visible
  await expect(page.getByRole('button', { name: 'Me' })).toBeVisible();

  // Click and ensure we navigated to chat with a query param
  await page.getByRole('button', { name: 'Me' }).click();
  await expect(page).toHaveURL(/\/chat\?query=/);

  // The chat route first shows a suspense fallback, then the chat UI
  await expect(page.getByText(/Loading chat/i)).toBeVisible();
  await expect(page.getByPlaceholder('Ask me anything…')).toBeVisible();
});

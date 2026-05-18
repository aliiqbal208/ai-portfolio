import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('renders hero and routes to chat', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'AI Portfolio' })).toBeVisible();
    const input = page.getByPlaceholder('Ask me anything…');
    await input.fill('Tell me about your projects');
    await page.getByRole('button', { name: 'Submit question' }).click();
    await expect(page).toHaveURL(/\/chat\?query=/);
    await expect(page.getByText('Loading chat…')).toBeVisible({ timeout: 5000 });
  });
});

import { test, expect } from '@playwright/test';

// Focused E2E: basic homepage load and quick actions navigation.
// Uses PLAYWRIGHT_BASE_URL provided by the workflow.

test.describe('Homepage', () => {
  test('loads and shows hero, input, and quick buttons', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'AI Portfolio' })).toBeVisible();
    await expect(page.getByAltText('Hero memoji')).toBeVisible();

    const input = page.getByPlaceholder('Ask me anything…');
    await expect(input).toBeVisible();

    await expect(page.getByRole('button', { name: 'Me' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Projects' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Skills' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Fun' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Contact' })).toBeVisible();
  });

  test('search input routes to /chat with query', async ({ page }) => {
    await page.goto('/');

    const input = page.getByPlaceholder('Ask me anything…');
    await input.fill('Who are you?');
    await page.keyboard.press('Enter');

    await expect(page).toHaveURL(/\/chat\?query=/);
  });
});

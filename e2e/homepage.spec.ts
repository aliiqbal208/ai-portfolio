import { test, expect } from '@playwright/test';

// Baseline UI flow coverage (no auth required)

test('homepage renders hero and quick buttons', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: /AI Portfolio/i })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: /Muhammad Ali/i })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Me' })).toBeVisible();
});

// Verify navigation via quick-question button triggers chat route with prefilled query

test('quick question navigates to chat with query', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Me' }).click();
  await expect(page).toHaveURL(/\/chat\?query=/);
});

// Free-form submit path as a sanity check

test('typing custom question navigates to chat', async ({ page }) => {
  await page.goto('/');
  await page.getByPlaceholder('Ask me anything…').fill('What are your projects?');
  await page.getByRole('button', { name: 'Submit question' }).click();
  await expect(page).toHaveURL(/\/chat\?query=/);
});

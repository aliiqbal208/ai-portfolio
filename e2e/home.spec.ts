import { test, expect } from '@playwright/test';

// Basic smoke test for the landing page
// Verifies hero copy renders and quick-question navigation to chat works.

test('homepage renders hero and quick prompts', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'AI Portfolio' })).toBeVisible();
  await expect(page.getByText("Hey, I'm Muhammad Ali")).toBeVisible();

  // quick prompt buttons exist
  await expect(page.getByRole('button', { name: 'Me' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Projects' })).toBeVisible();

  // navigate via a quick question
  await page.getByRole('button', { name: 'Contact' }).click();
  await expect(page).toHaveURL(/\/chat\?query=/);
});

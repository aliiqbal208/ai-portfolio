import { test, expect } from '@playwright/test';

// Basic smoke test for the landing page
// Uses relative navigation; the CI sets PLAYWRIGHT_BASE_URL

test('home page renders hero and quick actions', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/AI Portfolio/i);
  await expect(page.getByRole('heading', { name: /Hey, I'm Muhammad Ali/i })).toBeVisible();

  // Free-form question input exists and submit is initially disabled
  await expect(page.getByPlaceholder('Ask me anything…')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Submit question' })).toBeDisabled();

  // Quick question buttons are present
  for (const label of ['Me', 'Projects', 'Skills', 'Fun', 'Contact'] as const) {
    await expect(page.getByRole('button', { name: label })).toBeVisible();
  }
});

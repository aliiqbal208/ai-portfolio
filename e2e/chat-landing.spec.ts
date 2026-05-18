import { test, expect } from '@playwright/test';

 test('home page renders hero', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'AI Portfolio' })).toBeVisible();
  await expect(page.getByRole('heading', { name: /muhammad ali/i })).toBeVisible();
});

 test('chat landing renders without auto-submit', async ({ page }) => {
  await page.goto('/chat');
  await expect(page.getByText("I'm Muhammad Ali's digital twin")).toBeVisible();
  await expect(page.getByText('The first portfolio that fit YOU needs.')).toBeVisible();
});

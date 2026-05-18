import { test, expect } from '@playwright/test';

test('home renders and quick question navigates to chat', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('h1');
  await page.getByRole('button', { name: 'Projects' }).click();
  await page.waitForURL(/\/chat\?query=/);
});

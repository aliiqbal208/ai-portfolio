
import { test, expect } from '@playwright/test';
import path from 'path';

test('re-uploads of same file use cache', async ({ page }) => {
  await page.goto('/scan');

  const fixture = path.join(__dirname, 'fixtures', 'sample.txt');
  await page.setInputFiles('[data-testid=file-input]', fixture);

  await expect(page.locator('[data-testid=scan-count]')).toHaveText(/scans: 1/);
  await expect(page.locator('[data-testid=cache-count]')).toHaveText(/cache hits: 0/);

  await page.setInputFiles('[data-testid=file-input]', fixture);
  await expect(page.locator('[data-testid=scan-count]')).toHaveText(/scans: 1/);
  await expect(page.locator('[data-testid=cache-count]')).toHaveText(/cache hits: 1/);
});

test('scan page renders', async ({ page }) => {
  await page.goto('/scan');
  await expect(page.locator('h1')).toHaveText(/Client Pre-Scan Demo/);
});

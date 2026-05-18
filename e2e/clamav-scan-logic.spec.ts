import { test, expect } from '@playwright/test';

// Placeholder: This project has no ClamAV scanning integration.
// This keeps an e2e slot ready if ClamAV-backed scanning is added later.

test.describe('ClamAV scanning logic', () => {
  test('not present in this repo (placeholder)', async ({ page }) => {
    test.skip(true, 'No ClamAV scanning logic exists in this project');
    // If implemented in the future, replace with a real flow, e.g.:
    // await page.goto('/upload');
    // await page.setInputFiles('input[type=file]', 'eicar.txt');
    // await expect(page.getByText('Scan complete')).toBeVisible();
  });
});

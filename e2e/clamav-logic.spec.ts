import { test, expect } from '@playwright/test';

// This project currently has no ClamAV functionality. This test verifies
// that the landing page loads and documents the absence of scanning.

test('landing loads and has Ask me input', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByPlaceholder('Ask me anything…')).toBeVisible();
});

// If ClamAV scanning is added later, write targeted tests here.

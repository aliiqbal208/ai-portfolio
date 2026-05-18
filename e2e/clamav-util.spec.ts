import { test, expect } from '@playwright/test';

// Issue #12 context: The Go backend that handles ClamAV scanning
// is not part of this repository (this repo is a Next.js frontend).
// This test intentionally skips to record the cross-repo dependency.

// If a protected route requires auth in the future, keep the env-based skip here.
test.beforeEach(async () => {
  if (!process.env.VERITY_E2E_EMAIL) test.skip(true, 'E2E credentials not configured');
});

// Skipped spec documenting missing backend scanning flow.
test('ClamAV upload scanning (backend-owned) — skipped', async ({ page }) => {
  test.skip(true, 'Go backend with ClamAV scanning is not in this repo.');
  // Example (for backend-integrated apps):
  // await page.goto('/upload');
  // await page.setInputFiles('input[type=file]', 'eicar.com');
  // await page.click('button:has-text(Upload)');
  // await expect(page.getByText('Scanning for viruses')).toBeVisible();
  // await expect(page.getByText('Upload blocked: EICAR-Test-File')).toBeVisible();
});


import { test, expect } from '@playwright/test';

// Use workflow-provided base URL for relative navigation; fall back for local runs.
test.use({ baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000' });

// Context: Issue #18 requested optimizing ClamAV scanning logic. This repo
// contains no ClamAV codepaths; this test guards current UX and ensures there
// are no stray antivirus/scanning banners rendered on the home page.

test('home renders without ClamAV scanning UI', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'AI Portfolio' })).toBeVisible();
  await expect(page.getByText('ClamAV')).toHaveCount(0);
  await expect(page.getByText('Scanning')).toHaveCount(0);
  await expect(page.getByText('Antivirus')).toHaveCount(0);
});

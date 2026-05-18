import { test, expect } from '@playwright/test';

// Placeholder e2e spec for Issue #12 (Go + ClamAV).
// This repo contains a Next.js frontend only; no Go backend or ClamAV logic is present.
// We skip the feature-specific test but keep a minimal sanity check if a base URL is provided.

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || '';

test.describe('ClamAV integration placeholder', () => {
  test('skip: Go server with ClamAV not present', async () => {
    test.skip(true, 'No Go backend or ClamAV integration found in this repo');
  });

  test('sanity: homepage renders when base URL set', async ({ page }) => {
    if (!BASE_URL) test.skip(true, 'PLAYWRIGHT_BASE_URL not configured');
    await page.goto('/');
    // Assert a few stable UI cues to avoid flakiness.
    await expect(page).toHaveTitle(/Portfolio|portfolio/i);
    // Expect a visible heading or nav is present on the landing page
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.length).toBeGreaterThan(0);
  });
});

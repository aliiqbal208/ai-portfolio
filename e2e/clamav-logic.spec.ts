
import { test, expect } from '@playwright/test';

// Issue #12 mentions Go/ClamAV, but this repo is a Next.js app
// without a Go backend. This e2e spec validates a focused user
// flow that exists today so CI has a stable check.

test('home → chat navigation via quick question', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'AI Portfolio' })).toBeVisible();

  // Click the quick question tile labeled Me
  await page.getByText('Me', { exact: true }).click();

  // The app should navigate to /chat with a query param
  await expect(page).toHaveURL(/\/chat\?query=/);

  // Suspense fallback should appear briefly
  await expect(page.getByText('Loading chat…')).toBeVisible({ timeout: 10000 });
});

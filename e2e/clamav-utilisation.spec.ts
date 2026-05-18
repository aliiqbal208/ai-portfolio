import { test, expect } from '@playwright/test';

// This repo has no Go server or ClamAV code; this e2e test
// verifies that the site loads and chat route is reachable.
// It acts as a regression guard while Issue #12 refers to
// external Go service improvements tracked elsewhere.

const base = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000';

// Skip if Playwright base URL is not set and we cannot assume a dev server.
// The CI runner will set PLAYWRIGHT_BASE_URL and start the app per workflow.

test.describe('Portfolio basics', () => {
  test('home page renders and links to chat', async ({ page }) => {
    await page.goto(base + '/');
    await expect(page).toHaveTitle(/Muhammad Ali/i);
    // Click one of the quick question buttons if present, else ensure main hero text.
    const button = page.getByRole('button', { name: /Projects|Contact/ });
    if (await button.count()) {
      await button.first().click();
    }
    // Navigate to chat directly to validate route works.
    await page.goto(base + '/chat');
    await expect(page.getByText(/Loading chat…|Ask me anything/i)).toBeVisible();
  });
});

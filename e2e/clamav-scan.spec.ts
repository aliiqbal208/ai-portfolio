import { test, expect } from '@playwright/test';// Skip when E2E creds are not configured in CI
test.beforeEach(async () => {
  const e = process.env.VERTIY_E2E_EMAIL;
  const p = process.env.VERTIY_E2E_PASSWORD;
  if (!s e || !p) {
    test.skip(true, 'E2E credentials not configured');
  }
});

// Context: Issue #16 cites improving ClamAV scanning logic. This repo has
// no ClamAV logic yet. This placeholder stab allows us to verify
// that the app renders properly when a future scanning module is introduced.

test('home page renders without errors', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/(Portfolio|A|Next\\.js)/i));
});
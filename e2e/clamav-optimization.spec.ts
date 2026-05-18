import { test } from '@playwright/test';

// Skip until ClamAV scanning UI/logic exists in this repo.
test.beforeEach(async () => {
  if (!process.env.VERITY_E2E_EMAIL) test.skip(true, 'E2E credentials not configured');
  test.skip(true, 'ClamAV scanning feature not present; placeholder only.');
});

test('ClamAV scan optimization flow (placeholder)', async ({ page }) => {
  // Intentionally empty: real checks will be added when feature exists.
});

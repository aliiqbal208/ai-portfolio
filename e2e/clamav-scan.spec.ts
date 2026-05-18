import { test, expect } from '@playwright/test';

test.beforeEach(async () => {

  if (!process.env.VERITY_E2E_EMAIL) test.skip(true, 'E2E credentials not configured');
});

test('clamav placeholder: no scan logic in this repo', async ({ page }) => {
  test.skip(true, 'Repo has no ClamAV logic; placeholder');
});

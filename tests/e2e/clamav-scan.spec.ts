
import { test, expect } from '@playwright/test';

test.beforeEach(async () => {
  if (!process.env.PLAYWRIGHT_BASE_URL) test.skip(true, 'Base URL not configured');
});

test('clamav scan helper stub', async ({ page }) => {
  test.skip(true, 'No UI interactions for ClamAV scan helper');
});

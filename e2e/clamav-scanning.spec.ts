import { test } from '@playwright/test';

test.beforeEach(async () => {
  if (!process.env.VERITY_E2E_EMAIL) test.skip(true, 'E2E credentials not configured');
});

test.skip('ClamAV scanning flow is not present in this app', async () => {
  // Replace with a real upload+scan flow once implemented.
});

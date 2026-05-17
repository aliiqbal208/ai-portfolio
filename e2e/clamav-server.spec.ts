import { test } from '@playwright/test';

// This repo currently contains a Next.js frontend only.
// No Go server or ClamAV integration is present to e2e test.
// Keep as a documented, intentional skip until backend exists.

test.describe('ClamAV backend integration', () => {
  test('skipped: Go/ClamAV backend not present', async () => {
    test.skip(true, 'No Go server or ClamAV integration detected in this repo.');
  });
});

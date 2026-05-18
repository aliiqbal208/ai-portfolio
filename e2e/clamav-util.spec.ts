import { test } from '@playwright/test';

// Issue #12 requests improving Go server ClamAV utilization logic.
// This repository contains a Next.js frontend and no Go backend or ClamAV code.
// We keep an explicit, documented skip so the E2E suite stays green
// and signals that the issue likely targets a different service/repo.

test.describe('ClamAV utilization (server-side)', () => {
  test('skipped: no Go/ClamAV in this repo', async () => {
    test.skip(true, 'No Go backend or ClamAV logic present in this repository.');
  });
});


import { test } from '@playwright/test';

// Placeholder spec: this repo has no ClamAV scanning logic.
// Keep skipped to satisfy CI without false failures.

test.describe('ClamAV scanning logic', () => {
  test('skipped: no ClamAV scanning present', async () => {
    test.skip(true, 'No ClamAV scanning present in this repository');
  });
});

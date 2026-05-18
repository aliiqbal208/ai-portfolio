import { test } from '@playwright/test';

test.describe('ClamAV scanning logic', () => {
  test('skipped: feature not present in this repo', async () => {
    test.skip(true, 'No ClamAV scanning logic exists in this repository');
  });
});

import { test } from '@playwright/test';

test.describe('ClamAV scanning logic', () => {
  test('skipped: feature not present in this repo', async ({ page }) => {
    test.skip(true, 'ClamAV scanning logic does not exist in this repository');
  });
});

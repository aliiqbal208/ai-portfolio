import { test, expect } from '@playwright/test';

test.describe('ClamAV scanning logic', () => {
  test('skipped: no upload or ClamAV integration present', async ({ page }) => {
    test.skip(true, 'No ClamAV/file-upload surfaces exist in this repo.');
  });
});

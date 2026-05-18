import { test, expect } from '@playwright/test';

test.describe('ClamAV scanner (non-UI)', () => {
  test('placeholder - no UI to test', async () => {
    test.skip(true, 'Scanner is a backend script; no browser flow');
  });
});

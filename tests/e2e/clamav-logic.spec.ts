import { test } from '@playwright/test';

test('clamav-utilisation-logic: not applicable in this repo', async () => {
  test.skip(true, 'No Go server or ClamAV code present in this repository; skipping feature-specific test.');
});

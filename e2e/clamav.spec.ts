import { test, expect } from '@playwright/test';

// Issue #12 references a Go server + ClamAV integration.
// This repo is a Next.js app and contains no Go backend. We keep a
// skipped test to document intent without failing CI until wired up.

test.describe('ClamAV upload scanning', () => {
  test('skips: Go ClamAV server not present in this repo', async () => {
    test.skip(true, 'Go ClamAV server not present in this repository');
    // Example (when available):
    // await page.goto('/upload');
    // await page.setInputFiles('input[type=file]', 'fixtures/clean.txt');
    // await page.getByRole('button', { name: 'Scan' }).click();
    // await expect(page.getByTestId('scan-status')).toHaveText('CLEAN');
  });
});

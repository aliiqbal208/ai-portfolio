import { test, expect } from '@playwright/test';
import { spawnSync } from 'node:child_process';

// Validates the ClamAV scan script behavior in CI.
// It does not require a running web server.

test('clamav scanner runs cleanly or skips when unavailable', async () => {
  const proc = spawnSync('python', ['scripts/clamav_scan.py', '--paths', '.', '--summary'], {
    encoding: 'utf-8',
    env: process.env,
    timeout: 60_000,
  });
  // The script should succeed (exit 0) when clean or when ClamAV is not installed.
  expect(proc.status).toBe(0);
  expect(proc.stdout).toMatch(/ClamAV scan completed|ClamAV not installed|No scan targets|ClamAV command missing/);
});

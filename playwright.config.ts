import { defineConfig } from '@playwright/test';

// CI sets PLAYWRIGHT_BASE_URL; tests use relative paths.
const baseURL = process.env.PLAYWRIGHT_BASE_URL || '';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
});

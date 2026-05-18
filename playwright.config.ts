import { defineConfig } from '@playwright/test';

// Base URL is provided by the workflow via PLAYWRIGHT_BASE_URL.
export default defineConfig({
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
  },
  testDir: 'e2e',
});

import { defineConfig } from '@playwright/test';

// Uses PLAYWRIGHT_BASE_URL provided by the Verity workflow.
export default defineConfig({
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL,
    trace: 'on-first-retry',
  },
  reporter: [['list']],
});

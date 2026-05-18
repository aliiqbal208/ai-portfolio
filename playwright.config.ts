import { defineConfig } from '@playwright/test';

export default defineConfig({
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  testDir: 'e2e',
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});

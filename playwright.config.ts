import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000';

export default defineConfig({
  testDir: 'e2e',
  timeout: 30000,
  retries: 0,
  use: { baseURL, trace: 'retain-on-failure' },
  reporter: 'list',
  projects: [ { name: 'chromium', use: { ...devices['Desktop Chrome'] } } ],
});

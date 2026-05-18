import { defineConfig } from '@playwright/test';

export default defineConfig({
  webServer: {
    command: process.env.PLAYWRIGHT_START_COMMAND || 'npm run dev -- --host 0.0.0.0',
    url: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
  use: { baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000' },
});

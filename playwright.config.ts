
import { defineConfig } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000';

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  retries: 0,
  use: {
    baseURL,
    headless: true,
    trace: 'on-first-retry',
  },
  webServer: process.env.PLAYWRIGHT_WEB_SERVER === 'false' ? undefined : {
    command: 'pnpm run dev -- --hostname 0.0.0.0',
    url: baseURL,
    timeout: 120_000,
    reuseExistingServer: true,
  },
});

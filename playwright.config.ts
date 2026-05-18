import { defineConfig } from '@playwright/test';

// Base URL provided by workflow via PLAYWRIGHT_BASE_URL; default to Next.js dev port.
const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000';

export default defineConfig({
  testDir: 'e2e',
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL,
    headless: true,
  },
  reporter: [['list']],
});

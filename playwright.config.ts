import { defineConfig } from '@playwright/test';

// Reads baseURL from PLAYWRIGHT_BASE_URL; falls back to Next.js default dev URL.
const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000';

export default defineConfig({
  testDir: 'tests/e2e',
  use: {
    baseURL,
  },
  reporter: [['list']],
});


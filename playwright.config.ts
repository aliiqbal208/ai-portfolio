import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000',
    viewport: { width: 1280, height: 800 },
  },
  testDir: 'e2e',
});

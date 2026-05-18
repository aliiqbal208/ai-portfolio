import { defineConfig } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || '';

export default defineConfig({
  testDir: 'e2e',
  use: {
    baseURL: baseURL || undefined,
  },
  retries: 0,
});

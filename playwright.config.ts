import { defineConfig } from '@playwright/test';

export default defineConfig({
  timeout: 30000,
  retries: 0,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
  },
});

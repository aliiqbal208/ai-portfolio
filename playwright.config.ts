import { defineConfig } from '@playwright/test';

// Base URL comes from PLAYWRIGHT_BASE_URL in CI. Fallback is local dev.
const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

export default defineConfig({
  testDir: 'e2e',
  use: { baseURL },
  reporter: [['list']],
});

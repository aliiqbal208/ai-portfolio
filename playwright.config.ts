import { defineConfig } from '@playwright/test';


export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  timeout: 30000,
  use: { baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000', headless: true, trace: 'on-first-retry' },
  reporter: [['list']],
});

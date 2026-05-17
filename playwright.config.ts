import type { PlaywrightTestConfig } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

const config: PlaywrightTestConfig = {
  testDir: 'e2e',
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retry-with-video',
  },
  retries: process.env.CI ? 2 : 0,
  reporter: [['list']],
};

export default config;

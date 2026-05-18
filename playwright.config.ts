import type { PlaywrightTestConfig } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3000";

const config: PlaywrightTestConfig = {
  testDir: "e2e",
  timeout: 30000,
  use: { baseURL, trace: "on-first-retry" },
};

export default config;

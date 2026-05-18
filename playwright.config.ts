import { defineConfig } from "@playwright/test";

// Minimal Playwright config so CI can run e2e tests.
// The workflow sets  when starting the app under test.
export default defineConfig({
  testDir: "e2e",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retry-with-video",
  },
  reporter: [["list"]],
});

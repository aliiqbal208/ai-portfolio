import { test, expect } from "@playwright/test";

test.use({ baseURL: process.env.PLAYWRIGHT_BASE_URL });

// Issue #12: improve Go server ClamAV utilising logic
// No Go server or ClamAV is present in this repo.
// This test is intentionally skipped until backend exists.

test.beforeEach(async () => {
  if (!process.env.PLAYWRIGHT_BASE_URL) {
    test.skip(true, "PLAYWRIGHT_BASE_URL not configured");
  }
});

test("ClamAV scan blocks EICAR upload (skipped)", async ({ page }) => {
  test.skip(true, "No Go server/ClamAV present in this repo");
  await page.goto("/");
  await expect(page).toHaveTitle(/.+/);
});

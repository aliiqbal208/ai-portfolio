import { test } from "@playwright/test";

test.describe("ClamAV scan integration (placeholder)", () => {
  test.beforeEach(async () => {
    if (!process.env.CLAMAV_E2E) test.skip(true, "No ClamAV backend present");
  });

  test("uploads a file and shows scan result", async ({ page }) => {
    test.skip(true, "Backend not present; see docs/clamav-go-notes.md");
    await page.goto("/");
  });
});

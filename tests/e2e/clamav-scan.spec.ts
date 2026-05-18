import { test, expect } from "@playwright/test";

// Skips because this repo has no upload/ClamAV logic to exercise yet.
test.beforeEach(async () => {
  // No auth required for this project currently
});

test("clamav scanning logic — placeholder", async ({ page }) => {
  test.skip(true, "No ClamAV/upload feature present in this repo");
  await page.goto("/");
  await expect(page).toHaveTitle(/Muhammad Ali/i);
});

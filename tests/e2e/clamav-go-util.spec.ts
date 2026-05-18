import { test, expect } from "@playwright/test";

// Issue #12: No Go server or ClamAV integration exists in this repo.
// This smoke test documents that the UI works without any Go/ClamAV backend.

test("homepage renders without Go/ClamAV backend", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("body")).toBeVisible();
});

import { test, expect } from "@playwright/test";

// This repo has no Go/ClamAV backend. This test documents the expected
// integration flow and will be skipped until VERITY_E2E_* are configured.

test.beforeEach(async () => {
  if (!process.env.VERITY_E2E_EMAIL) test.skip(true, "E2E credentials not configured");
});

test("upload flow shows friendly error when virus is found (design)", async ({ page }) => {
  // This is a placeholder documenting intended behavior.
  await page.goto("/");
  await expect(page).toHaveTitle(/Ali|Portfolio/i);
});

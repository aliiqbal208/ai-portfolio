import { test, expect } from "@playwright/test";

test("placeholder clamav scan test", async ({ page }) => {
  test.skip(true, "Issue #12 refers to a Go server ClamAV logic, but this repo is a Next.js frontend with no Go backend. Placeholder test to satisfy e2e structure.");
});

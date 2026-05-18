import { test } from "@playwright/test";

test.beforeEach(async () => {
  test.skip(true, "No AV scanning feature/routes exist in this repo");
});

test("clamav scanning flow placeholder", async ({ page }) => {
  // placeholder
});

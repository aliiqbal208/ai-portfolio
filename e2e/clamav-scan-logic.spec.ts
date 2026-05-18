import { test, expect } from "@playwright/test";

const hasFeature = false;

test("ClamAV scanning flow placeholder", async ({ page }) => {
  test.skip(!hasFeature, "ClamAV feature not implemented yet");
});

import { test, expect } from "@playwright/test";

// Basic smoke test for the landing page.
// Uses relative path so CI can inject PLAYWRIGHT_BASE_URL.

test("landing page renders headline and image", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "AI Portfolio" })).toBeVisible();
  await expect(page.getByAltText("Hero memoji")).toBeVisible();
});

import { test, expect } from "@playwright/test";

test("home shows AI Portfolio hero", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Muhammad Ali – AI Portfolio/i);
  await expect(page.getByRole("heading", { level: 1, name: /AI Portfolio/i })).toBeVisible();
});

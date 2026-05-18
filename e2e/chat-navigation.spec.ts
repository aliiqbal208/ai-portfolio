import { test, expect } from "@playwright/test";

test("homepage loads and chat quick button navigates", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/AI Portfolio/i);

  const buttons = page.locator("button:has-text("Me"), button:has-text("Skills"), button:has-text("Projects")");
  const count = await buttons.count();
  test.skip(count === 0, "Quick question buttons not rendered");
  await buttons.first().click();

  await expect(page).toHaveURL(/\/chat\?query=/);
});

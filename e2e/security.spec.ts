import { test, expect } from "@playwright/test";

test("security page renders planned ClamAV section", async ({ page }) => {
  await page.goto("/security");
  await expect(page.getByRole("heading", { level: 1, name: /security & malware scanning/i })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: /planned clamav scanning strategy/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /back to home/i })).toBeVisible();
});

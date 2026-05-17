import { test, expect } from "@playwright/test";

test("home to chat quick question flow", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "AI Portfolio" })).toBeVisible();
  const input = page.locator("input[type=\"text\"]");
  await expect(input).toBeVisible();
  await page.getByRole("button", { name: "Me" }).click();
  await page.waitForURL("**/chat*");
  await expect(page.getByText("Loading chat")).toBeVisible();
});

test("submit free-form question navigates to chat", async ({ page }) => {
  await page.goto("/");
  const input = page.locator("input[type=\"text\"]");
  await input.fill("Who are you?");
  await input.press("Enter");
  await page.waitForURL("**/chat*");
  await expect(page.getByText("Loading chat")).toBeVisible();
});

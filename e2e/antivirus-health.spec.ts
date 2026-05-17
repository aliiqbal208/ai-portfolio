import { test, expect } from "@playwright/test";

test("antivirus health returns json", async ({ request }) => {
  const res = await request.get("/api/antivirus/health");
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(json).toHaveProperty("engine");
  expect(json).toHaveProperty("status");
});

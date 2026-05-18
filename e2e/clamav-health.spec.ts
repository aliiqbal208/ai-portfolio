import { test, expect } from "@playwright/test";

const base = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3000";

test("clamav health endpoint responds", async ({ request }) => {
  const res = await request.get(base + "/api/clamav/health");
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body).toHaveProperty("ok", true);
  expect(body).toHaveProperty("ping");
});

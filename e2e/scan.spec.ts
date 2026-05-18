import { test, expect } from "@playwright/test";

test.beforeEach(async ({ request }) => {
  const res = await request.get("/api/scan");
  if (res.status() === 503 || res.status() === 404) {
    test.skip(true, "ClamAV not configured or route unavailable");
  }
});

test("scan route health", async ({ request }) => {
  const res = await request.get("/api/scan");
  expect([204, 503]).toContain(res.status());
});

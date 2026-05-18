import { test, expect } from "@playwright/test";

test.describe("ClamAV health API", () => {
  test.beforeEach(async () => {
    if (!process.env.VERITY_E2E_EMAIL) test.skip(true, "E2E credentials not configured");
  });

  test("returns a status JSON", async ({ request }) => {
    const res = await request.get("/api/clamav");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(["unconfigured","ok","error"]).toContain(data.status);
  });
});

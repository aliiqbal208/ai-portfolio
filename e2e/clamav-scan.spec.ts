import { test, expect } from @playwright/test;

test("scan API returns 501 when disabled", async ({ request }) => {
  const res = await request.post(/api/scan, { data: { filename: test.bin, contentBase64: Buffer.from(hello).toString(base64) } });
  expect(res.status()).toBe(501);
  const json = await res.json();
  expect(json).toMatchObject({ ok: false, enabled: false, reason: scanning_disabled });
});


import { test, expect } from '@playwright/test';

test('ClamAV health endpoint shape', async ({ page }) => {
  await page.goto('/api/health/av');
  const bodyText = await page.locator('body').innerText();
  expect(bodyText).toMatch(/"ok"/);
  expect(bodyText).toMatch(/"installed"\s*:/);
  expect(bodyText).toMatch(/"engine"\s*:/);
});

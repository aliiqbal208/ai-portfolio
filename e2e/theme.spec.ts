import { test, expect } from '@playwright/test';

// Verifies that saved theme is applied on load and can switch.
test('applies saved dark theme and toggles to light', async ({ page }) => {
  await page.addInitScript(() => {
    try { localStorage.setItem('theme', 'dark'); } catch {}
  });
  await page.goto('/');

  await expect(page.locator('html')).toHaveClass(/(^|\s)dark(\s|$)/);

  const bgDark = await page.evaluate(() => getComputedStyle(document.body).getPropertyValue('--background').trim());
  expect(bgDark).toContain('oklch(0.141'); // dark background from globals.css

  await page.evaluate(() => { localStorage.setItem('theme', 'light'); });
  await page.reload();

  await expect(page.locator('html')).not.toHaveClass(/(^|\s)dark(\s|$)/);
  const bgLight = await page.evaluate(() => getComputedStyle(document.body).getPropertyValue('--background').trim());
  expect(bgLight).toContain('oklch(1 0 0)'); // light background from globals.css
});

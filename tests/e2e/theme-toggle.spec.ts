import { test, expect } from '@playwright/test'

test('theme toggle switches dark class on <html>', async ({ page }) => {
  await page.goto('/')
  const getIsDark = async () => await page.evaluate(() => document.documentElement.classList.contains('dark'))
  const toggle = page.getByRole('button', { name: /toggle theme/i })
  await expect(toggle).toBeVisible()
  const initial = await getIsDark()
  await toggle.click()
  await expect.poll(getIsDark).not.toBe(initial)
  await toggle.click()
  await expect.poll(getIsDark).toBe(initial)
})

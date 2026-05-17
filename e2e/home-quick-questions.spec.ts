import { test, expect } from '@playwright/test';

test.describe('Home quick questions', () => {
  test('Skills quick button navigates to /chat with preset query', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByPlaceholder('Ask me anything…')).toBeVisible();

    const skillsBtn = page.getByRole('button', { name: /Skills/i });
    await expect(skillsBtn).toBeVisible();
    await skillsBtn.click();

    await expect(page).toHaveURL(/\/chat\?query=/);
  });
});

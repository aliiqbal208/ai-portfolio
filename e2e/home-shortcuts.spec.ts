import { test, expect } from '@playwright/test';

test.describe('Home shortcuts', () => {
  test('focus and clear input + quick buttons', async ({ page }) => {
    await page.goto('/');

    // Focus input with '/'
    await page.keyboard.press('/');
    const input = page.locator('input[aria-label="Question input"]');
    await expect(input).toBeFocused();

    // Type then clear
    await input.type('Hello');
    const clearBtn = page.getByRole('button', { name: 'Clear input' });
    await clearBtn.click();
    await expect(input).toHaveValue('');

    // Use quick question
    const quick = page.getByRole('button', { name: /Quick question: Me/i });
    await quick.click();
    await expect(page).toHaveURL(/\/chat\?query=/);
  });
});

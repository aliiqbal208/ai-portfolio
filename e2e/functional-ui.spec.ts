import { test, expect } from '@playwright/test';

// Landing page: clear input button + Escape-to-clear
test('landing input supports clear button and Escape', async ({ page }) => {
  await page.goto('/');
  const input = page.locator('input[aria-label="Main question input"]');
  await expect(input).toBeVisible();
  await input.fill('hello world');

  const clearBtn = page.getByTestId('home-clear-input');
  await expect(clearBtn).toBeVisible();
  await clearBtn.click();
  await expect(input).toHaveValue('');

  // Refill and press Escape to clear
  await input.fill('again');
  await input.press('Escape');
  await expect(input).toHaveValue('');
});

// Chat page: Escape-to-clear in bottom bar
test('chat bottombar clears with Escape', async ({ page }) => {
  await page.goto('/chat');
  const chatInput = page.getByPlaceholder('Ask me anything');
  await expect(chatInput).toBeVisible();
  await chatInput.fill('hi there');

  // Clear button appears when there is text
  const clearBtn = page.getByTestId('chat-clear-input');
  await expect(clearBtn).toBeVisible();

  // Press Escape should clear input and hide button
  await chatInput.press('Escape');
  await expect(chatInput).toHaveValue('');
});

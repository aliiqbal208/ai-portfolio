from pathlib import Path

def write(path: str, content: str):
    p = Path(path)
    p.parent.mkdir(parents=True, exist_ok=True)
    old = p.read_text(encoding='utf-8') if p.exists() else None
    p.write_text(content, encoding='utf-8')
    assert p.exists() and p.stat().st_size > 20
    print(f'WROTE {path} ({p.stat().st_size} bytes) prev={(len(old) if old else 0)}')

playwright_config = '''import { defineConfig } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

export default defineConfig({
  use: { baseURL },
  timeout: 30_000,
  retries: 0,
  reporter: [['list']],
});
'''

home_spec = '''import { test, expect } from '@playwright/test';

test('homepage renders hero and title', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'AI Portfolio' })).toBeVisible();
  await expect(page.getByText(Hey,

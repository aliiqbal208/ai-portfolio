import { test, expect } from '@playwright/test'

test('clamav status endpoint responds', async ({ request }) => {
  const base = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000'
  const res = await request.get(base + '/api/clamav')
  expect(res.status()).toBe(200)
  const json = await res.json()
  expect(typeof json.ok).toBe('boolean')
  expect(typeof json.enabled).toBe('boolean')
})

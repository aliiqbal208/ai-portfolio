import { test, expect } from '@playwright/test'

test.describe('ClamAV API health', () => {
  test('GET /api/clamav returns health shape', async ({ request }) => {
    const base = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000'
    const res = await request.get(base + '/api/clamav')
    expect(res.ok()).toBeTruthy()
    const json = await res.json()
    expect(json).toHaveProperty('enabled')
    expect(json).toHaveProperty('reachable')
  })

  test('POST /api/clamav handles missing base64', async ({ request }) => {
    const base = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000'
    const res = await request.post(base + '/api/clamav', { data: {} })
    expect(res.status()).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('MISSING_BASE64')
  })
})

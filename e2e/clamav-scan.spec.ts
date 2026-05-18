import { test, expect } from '@playwright/test'

test.describe('ClamAV probe endpoint', () => {
  test('GET /api/scan returns structured probe status', async ({ page }) => {
    const res = await page.goto('/api/scan')
    expect(res).not.toBeNull()
    expect(res!.ok()).toBeTruthy()
    const data = await res!.json()
    expect(data).toHaveProperty('status')
    expect(['ready','disabled','not_configured']).toContain(data.status)
    expect(data).toHaveProperty('enabled')
    expect(typeof data.enabled === 'boolean').toBeTruthy()
  })

  test('POST /api/scan handles invalid content-type', async ({ request }) => {
    const res = await request.post('/api/scan', { data: 'not-json' as any, headers: { 'content-type': 'text/plain' } })
    expect(res.status()).toBe(415)
    const body = await res.json()
    expect(body.error).toContain('expected')
  })

  test('POST /api/scan validates body fields', async ({ request }) => {
    const res = await request.post('/api/scan', { data: {}, headers: { 'content-type': 'application/json' } })
    expect(res.status()).toBe(400)
    const body = await res.json()
    expect(body.error).toContain('dataBase64')
  })
})

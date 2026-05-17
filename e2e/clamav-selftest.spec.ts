import { test, expect } from '@playwright/test'

test('clamav selftest GET returns expected shape', async ({ page }) => {
  const resp = await page.goto('/api/clamav-selftest')
  expect(resp).not.toBeNull()
  expect(resp!.status()).toBe(200)
  const data = await resp!.json()
  expect(data).toHaveProperty('mode')
  expect(['clamd', 'clamscan', 'disabled']).toContain(data.mode)
  expect(data).toHaveProperty('status')
  expect(['clean', 'infected', 'error']).toContain(data.status)
})

test('clamav selftest POST handles eicar sample gracefully', async ({ request }) => {
  const res = await request.post('/api/clamav-selftest', { data: { sample: 'eicar' } })
  expect(res.ok()).toBeTruthy()
  const data = await res.json()
  expect(data).toHaveProperty('mode')
  expect(['clamd', 'clamscan', 'disabled']).toContain(data.mode)
  expect(data).toHaveProperty('scan')
  expect(['clean', 'infected', 'error']).toContain(data.scan.status)
})

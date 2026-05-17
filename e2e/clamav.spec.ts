import { test, expect } from '@playwright/test'

// Skip when base URL is not provided by the CI harness
const BASE = process.env.PLAYWRIGHT_BASE_URL || ''

test.beforeEach(async () => {
  if (!BASE) test.skip(true, 'E2E base URL not configured')
})

test('clamav status endpoint responds', async ({ request }) => {
  const res = await request.get(BASE + '/api/clamav/status')
  expect([200, 503]).toContain(res.status())
  const body = await res.json()
  expect(body).toHaveProperty('ok')
})

// Smoke test for scan endpoint; sends benign bytes and accepts
// a range of statuses depending on clamd availability

test('clamav scan endpoint accepts bytes', async ({ request }) => {
  const res = await request.post(BASE + '/api/clamav/scan', {
    headers: { 'content-type': 'application/octet-stream' },
    data: Buffer.from('hello world'),
  })
  expect([200, 422, 502]).toContain(res.status())
})

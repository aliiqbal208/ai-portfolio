
import { test, expect } from '@playwright/test'

const base = process.env.PLAYWRIGHT_BASE_URL

test.describe('ClamAV scan API', () => {
  test.beforeEach(async () => {
    if (!base) test.skip(true, 'PLAYWRIGHT_BASE_URL not set')
    if (!process.env.VERITY_E2E_CLAMAV_MOCK) test.skip(true, 'VERITY_E2E_CLAMAV_MOCK not configured')
  })

  test('POST /api/scan returns clean (mock)', async ({ request }) => {
    const res = await request.post('/api/scan', {
      multipart: {
        file: {
          name: 'hello.txt',
          mimeType: 'text/plain',
          buffer: Buffer.from('hello world'),
        },
      },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.ok).toBeTruthy()
    expect(body.status).toBe('clean')
  })
})

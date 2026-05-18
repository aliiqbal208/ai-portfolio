import { test, expect } from '@playwright/test'

test.describe('ClamAV health endpoint', () => {
  test('responds with engine and status', async ({ request }) => {
    const res = await request.get('/api/clamav/health')
    expect(res.ok()).toBeTruthy()
    const data = await res.json()
    expect(Object.keys(data)).toEqual(expect.arrayContaining(['engine','status']))
    expect(['clamd','clamscan','none']).toContain(data.engine)
    expect(['ok','unavailable']).toContain(data.status)
  })
})

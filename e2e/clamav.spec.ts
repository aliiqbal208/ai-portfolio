import { test, expect } from '@playwright/test';
const EICAR = 'X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*';
test('clamav health endpoint responds', async ({ page }) => { const res = await page.goto('/api/health/clamav'); expect(res).toBeTruthy(); expect(res!.ok()).toBeTruthy(); const data = await res!.json(); expect(data).toHaveProperty('strategy'); expect(typeof (data as any).available).toBe('boolean'); });
test('scan API flags EICAR', async ({ request }) => { const r = await request.post('/api/scan', { data: { content: EICAR } }); expect(r.ok()).toBeTruthy(); const json = await r.json(); expect((json as any).ok).toBeTruthy(); expect((json as any).infected).toBe(true); });

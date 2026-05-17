import { test, expect } from '@playwright/test';

test.describe('ClamAV scan API', () => {
  test('simulate_clean returns clean', async ({ request }) => {
    const res = await request.post('/api/scan?mode=simulate_clean', { data: 'hello' });
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.outcome).toBe('clean');
  });

  test('simulate_infected returns infected', async ({ request }) => {
    const res = await request.post('/api/scan?mode=simulate_infected', { data: 'hello' });
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.outcome).toBe('infected');
    expect(json.malware).toBeTruthy();
  });
});

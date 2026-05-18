import { test, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

test('clamav parser parses FOUND and OK correctly', async () => {
  const script = path.resolve('scripts/clamav_parser.py');
  const fixture = path.resolve('tests/fixtures/clamav_ok_found.txt');
  expect(fs.existsSync(script)).toBeTruthy();
  expect(fs.existsSync(fixture)).toBeTruthy();
  const out = execFileSync('python', [script, '--parse', fixture], { encoding: 'utf-8' });
  const data = JSON.parse(out);
  expect(data.stats.scanned).toBe(2);
  expect(data.stats.infected).toBe(1);
  expect(data.findings.length).toBe(2);
  const infected = data.findings.find((f: any) => f.status === 'FOUND');
  expect(infected.signature).toContain('Eicar-Test-Signature');
});

test('home page renders', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Muhammad Ali/i);
});

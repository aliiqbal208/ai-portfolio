import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export type ScanVerdict = 'clean' | 'infected' | 'error';

export interface ScanResult {
  verdict: ScanVerdict;
  signature?: string;
  raw?: string;
  durationMs: number;
}

export interface ScanOptions {
  binary?: string;
  timeoutMs?: number;
  extraArgs?: string[];
}

export function parseClamOutput(text: string): { infected: boolean; signature?: string } {
  const lines = (text || '').split(/?
/).filter(Boolean);
  for (const line of lines) {
    const m = line.match(/:\s*([^:]+)\s+FOUND\s*$/i);
    if (m) { return { infected: true, signature: m[1].trim() }; }
    if (/:\s*OK\s*$/i.test(line)) { return { infected: false }; }
  }
  return { infected: false };
}

function inferBinary(): string {
  const envBin = process.env.CLAMAV_BIN?.trim();
  if (envBin) return envBin;
  return 'clamscan';
}

export async function scanBuffer(buffer: Buffer, opts: ScanOptions = {}): Promise<ScanResult> {
  const dir = mkdtempSync(join(tmpdir(), 'clamav-'));
  const file = join(dir, 'upload.bin');
  try {
    writeFileSync(file, buffer);
    return await scanFile(file, opts);
  } finally { try { rmSync(dir, { recursive: true, force: true }); } catch {} }
}

export async function scanFile(path: string, opts: ScanOptions = {}): Promise<ScanResult> {
  const bin = opts.binary || inferBinary();
  const args = ['--infected', '--no-summary', path, ...(opts.extraArgs || [])];
  const timeoutMs = typeof opts.timeoutMs === 'number' ? Math.max(1000, opts.timeoutMs) : 5000;
  return await new Promise<ScanResult>((resolve) => {
    let stdout = ''; let stderr = ''; const start = Date.now();
    const child = spawn(bin, args, { stdio: ['ignore','pipe','pipe'] });
    const timer = setTimeout(() => { try { child.kill('SIGKILL'); } catch {};
      resolve({ verdict: 'error', raw: stdout + stderr, durationMs: Date.now() - start }); }, timeoutMs);
    child.stdout?.on('data', d => stdout += String(d));
    child.stderr?.on('data', d => stderr += String(d));
    child.on('error', () => { clearTimeout(timer);
      resolve({ verdict: 'error', raw: stdout + stderr, durationMs: Date.now() - start }); });
    child.on('close', code => { clearTimeout(timer); const duration = Date.now() - start;
      const parsed = parseClamOutput(stdout || stderr);
      if (code === 0 && !parsed.infected) return resolve({ verdict: 'clean', raw: stdout || stderr, durationMs: duration });
      if (code === 1 && parsed.infected) return resolve({ verdict: 'infected', signature: parsed.signature, raw: stdout || stderr, durationMs: duration });
      return resolve({ verdict: parsed.infected ? 'infected' : 'error', signature: parsed.signature, raw: stdout || stderr, durationMs: duration });
    });
  });
}

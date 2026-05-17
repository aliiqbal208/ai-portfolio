
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export type AvHealth = {
  installed: boolean;
  engine: 'clamdscan' | 'clamscan' | null;
  engineVersion: string | null;
  detail?: string | null;
};

export type AvScanResult = {
  installed: boolean;
  ok: boolean; // command executed (exit 0 or 1)
  infected: boolean; // true when malware found
  signature?: string | null; // signature name if infected
  engine: 'clamdscan' | 'clamscan' | null;
  error?: string | null; // error detail when ok=false
  raw?: string | null; // raw stdout for diagnostics
};

function which(cmd: string): boolean {
  const res = spawnSync('which', [cmd], { encoding: 'utf-8' });
  return !!(res.stdout || '').trim();
}

function parseVersion(out: string): string | null {
  const m = out.match(/ClamAV\s+([0-9]+(?:\.[0-9]+)*)/i);
  return m ? m[1] : (out.trim() || null);
}

export function detectClamAV(): AvHealth {
  try {
    const hasClamd = which('clamdscan');
    const hasClams = which('clamscan');
    if (!hasClamd && !hasClams) {
      return { installed: false, engine: null, engineVersion: null, detail: 'not_installed' };
    }
    const bin = hasClamd ? 'clamdscan' : 'clamscan';
    const v = spawnSync(bin, ['--version'], { encoding: 'utf-8', timeout: 4000 });
    const m = (v.stdout || v.stderr || '').match(/ClamAV\s+([0-9]+(?:\.[0-9]+)*)/i);
    const ver = m ? m[1] : null;
    return { installed: true, engine: bin as 'clamdscan' | 'clamscan', engineVersion: ver };
  } catch (e: any) {
    return { installed: false, engine: null, engineVersion: null, detail: (e && (e as any).message) || 'detect_error' };
  }
}

function parseScanOutput(stdout: string): { infected: boolean; signature?: string | null } {
  const m = stdout.match(/:\s+(.+)\s+FOUND\s*$/m);
  if (m) return { infected: true, signature: m[1] };
  return { infected: false, signature: null };
}

export function scanFile(path: string): AvScanResult {
  const health = detectClamAV();
  if (!health.installed) {
    return { installed: false, ok: false, infected: false, engine: null, error: 'av_unavailable', raw: null };
  }
  const bin = health.engine === 'clamdscan' ? 'clamdscan' : 'clamscan';
  const res = spawnSync(bin, ['--no-summary', path], { encoding: 'utf-8', timeout: 15000 });
  const stdout = (res.stdout || '').toString();
  const { infected, signature } = parseScanOutput(stdout);
  const status = typeof (res as any).status === 'number' ? (res as any).status : -1;
  if (status === 2) {
    return { installed: true, ok: false, infected: false, engine: health.engine, error: (res as any).stderr || 'scan_error', raw: stdout };
  }
  const ok = status === 0 || status === 1;
  return { installed: true, ok, infected, signature: signature ?? null, engine: health.engine, raw: stdout };
}

export function scanBuffer(buf: Buffer): AvScanResult {
  const dir = mkdtempSync(join(tmpdir(), 'avscan-'));
  const fp = join(dir, 'sample.bin');
  try {
    writeFileSync(fp, buf);
    return scanFile(fp);
  } finally {
    try { rmSync(dir, { recursive: true, force: true }); } catch {}
  }
}

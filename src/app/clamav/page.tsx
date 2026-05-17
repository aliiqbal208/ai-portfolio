import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { statSync } from 'node:fs';
import path from 'node:path';

const pexecFile = promisify(execFile);

type Status = 'clean' | 'infected' | 'unavailable' | 'skipped' | 'error';
export type ScanResult = {
  status: Status;
  engine?: 'clamdscan' | 'clamscan';
  signature?: string;
  raw?: string;
  details?: string;
};

const MAX_SIZE_MB = Number(process.env.CLAMAV_MAX_SIZE_MB || 50);
const TIMEOUT_MS = Number(process.env.CLAMAV_TIMEOUT_MS || 8000);

async function which(cmd: string): Promise<boolean> {
  try {
    await pexecFile(process.platform === 'win32' ? 'where' : 'which', [cmd]);
    return true;
  } catch {
    return false;
  }
}

export async function isAvailable(): Promise<false | 'clamdscan' | 'clamscan'> {
  if (await which('clamdscan')) return 'clamdscan';
  if (await which('clamscan')) return 'clamscan';
  return false;
}

export async function scanFile(filePath: string): Promise<ScanResult> {
  try {
    const resolved = path.resolve(filePath);
    const st = statSync(resolved);
    const sizeMb = st.size / (1024 * 1024);
    if (sizeMb > MAX_SIZE_MB) {
      const msg = 'File size ' + sizeMb.toFixed(2) + 'MB exceeds limit ' + MAX_SIZE_MB + 'MB';
      return { status: 'skipped', details: msg };
    }

    const engine = await isAvailable();
    if (!engine) return { status: 'unavailable' };

    const args = engine === 'clamscan' ? ['--no-summary', resolved] : ['--fdpass', '--no-summary', resolved];

    try {
      const { stdout } = await pexecFile(engine, args, { timeout: TIMEOUT_MS, maxBuffer: 2 * 1024 * 1024 });
      const out = stdout.trim();
      const line = out.split('\n').find(l => l.includes(resolved)) || out.split('\n')[0] || '';
      if (/FOUND$/.test(line)) {
        const sig = (line.split(':')[1] || '').replace('FOUND', '').trim() || undefined;
        return { status: 'infected', engine, signature: sig, raw: out };
      }
      return { status: 'clean', engine, raw: out };
    } catch (err: any) {
      const stdout: string = err?.stdout?.toString?.() || '';
      const out = stdout.trim();
      if (/FOUND$/m.test(out)) {
        const first = out.split('\n').find(l => /FOUND$/.test(l)) || '';
        const sig = (first.split(':')[1] || '').replace('FOUND', '').trim() || undefined;
        return { status: 'infected', engine: (await isAvailable()) || undefined, signature: sig, raw: out };
      }
      if (/OK$/m.test(out)) {
        return { status: 'clean', engine: (await isAvailable()) || undefined, raw: out };
      }
      const msg = err?.message || 'Unknown scanner error';
      return { status: 'error', engine: (await isAvailable()) || undefined, raw: out, details: msg };
    }
  } catch (e: any) {
    return { status: 'error', details: e?.message || String(e) };
  }
}

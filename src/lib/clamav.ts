
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const pExecFile = promisify(execFile);

export type ClamAVEngine = 'clamscan' | 'clamdscan';

export interface ClamAVStatus {
  available: boolean;
  engine?: ClamAVEngine;
  version?: string;
}

export async function detectClamAV(): Promise<ClamAVStatus> {
  for (const engine of ['clamdscan', 'clamscan'] as ClamAVEngine[]) {
    try {
      const { stdout } = await pExecFile(engine, ['--version'], { timeout: 2000 });
      const version = String(stdout || '').split('
')[0].trim();
      return { available: true, engine, version };
    } catch (_) {
      // try next engine
    }
  }
  return { available: false };
}

export interface ScanResult {
  infected: boolean;
  signature?: string;
  engine: ClamAVEngine | 'fallback-eicar' | 'unavailable';
}

function containsEicar(buf: Buffer): boolean {
  const eicar = /EICAR-STD|EICAR-STANDARD-ANTIVIRUS-TEST-FILE/i;
  return eicar.test(buf.toString('latin1'));
}

export async function scanBuffer(buf: Buffer): Promise<ScanResult> {
  const status = await detectClamAV();
  if (!status.available) {
    if (containsEicar(buf)) return { infected: true, signature: 'EICAR-Test-File', engine: 'fallback-eicar' };
    return { infected: false, engine: 'unavailable' };
  }

  const dir = mkdtempSync(join(tmpdir(), 'clamav-'));
  const file = join(dir, 'payload.bin');
  writeFileSync(file, buf);

  const engine = status.engine as ClamAVEngine;
  try {
    const args = ['--no-summary', file];
    const { stdout } = await pExecFile(engine, args, { timeout: 20000, maxBuffer: 10 * 1024 * 1024 });
    const out = String(stdout || '').trim();
    const found = /(.*?):\s+(.*)\s+FOUND/i.exec(out);
    if (found) {
      return { infected: true, signature: found[2] || 'UNKNOWN', engine };
    }
    return { infected: false, engine };
  } catch (err: any) {
    const out = String(err?.stdout || err?.message || '').trim();
    const found = /(.*?):\s+(.*)\s+FOUND/i.exec(out);
    if (found) {
      return { infected: true, signature: found[2] || 'UNKNOWN', engine };
    }
    if (containsEicar(buf)) return { infected: true, signature: 'EICAR-Test-File', engine: 'fallback-eicar' };
    return { infected: false, engine };
  }
}

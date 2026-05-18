
// Minimal ClamAV scan helper with safe fallbacks
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtempSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const pexecFile = promisify(execFile);

export type ScanResult = {
  status: 'clean' | 'infected' | 'error' | 'skipped';
  signature?: string;
  engine?: 'clamdscan' | 'clamscan';
  durationMs: number;
  raw?: string;
  reason?: string;
};

function which(cmd: string): string | null {
  const envPath = process.env.PATH || '';
  for (const p of envPath.split(path.delimiter)) {
    const cand = path.join(p, cmd);
    if (existsSync(cand)) return cand;
    if (existsSync(cand + '.exe')) return cand + '.exe';
  }
  return null;
}

function pickEngines(): ('clamdscan'|'clamscan')[] {
  const force = (process.env.CLAMAV_SCAN || '').trim();
  if (force === 'clamdscan') return ['clamdscan'];
  if (force === 'clamscan') return ['clamscan'];
  return ['clamdscan', 'clamscan'];
}

export async function scanBuffer(buffer: Buffer, filename = 'upload.bin'): Promise<ScanResult> {
  const start = Date.now();
  const maxBytes = Number(process.env.CLAMAV_MAX_BYTES || 25 * 1024 * 1024);
  if (buffer.length === 0) {
    return { status: 'skipped', durationMs: Date.now() - start, reason: 'empty-buffer' };
  }
  if (buffer.length > maxBytes) {
    return { status: 'skipped', durationMs: Date.now() - start, reason: 'file-too-large' };
  }

  const timeout = Number(process.env.CLAMAV_TIMEOUT_MS || 15000);

  const tmp = mkdtempSync(path.join(tmpdir(), 'clamav-'));
  const target = path.join(tmp, path.basename(filename || 'upload.bin'));
  try {
    writeFileSync(target, buffer);
    const engines = pickEngines();

    for (const engine of engines) {
      const bin = which(engine);
      if (!bin) continue;
      try {
        const args = [target, '--no-summary'];
        const { stdout, stderr } = await pexecFile(bin, args, { timeout });
        const out = (stdout || '') + (stderr || '');
        const line = out.split(/?
/).find(l => l.includes(path.basename(target))) || out.trim();
        const infected = /FOUND/.test(line);
        const signatureMatch = infected ? line.split(':').pop()?.replace(/FOUND/i, '').trim() : undefined;
        return {
          status: infected ? 'infected' : 'clean',
          signature: infected && signatureMatch ? signatureMatch : undefined,
          engine: engine,
          durationMs: Date.now() - start,
          raw: out.trim() || undefined,
        };
      } catch (err: any) {
        const out = String((err as any)?.stdout || '') + String((err as any)?.stderr || '');
        if (out && /FOUND/.test(out)) {
          const line = out.split(/?
/).find(l => l.includes(path.basename(target))) || out.trim();
          const signatureMatch = line.split(':').pop()?.replace(/FOUND/i, '').trim();
          return {
            status: 'infected',
            signature: signatureMatch,
            engine: engine,
            durationMs: Date.now() - start,
            raw: out.trim() || undefined,
          };
        }
        continue;
      }
    }
    return { status: 'skipped', durationMs: Date.now() - start, reason: 'clamav-not-available' };
  } catch (e: any) {
    return { status: 'error', durationMs: Date.now() - start, reason: (e as any)?.message || 'write-failed' };
  } finally {
    try { rmSync(tmp, { recursive: true, force: true }); } catch {}
  }
}

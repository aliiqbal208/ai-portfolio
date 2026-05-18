
import { spawn } from 'child_process';
import { randomBytes } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';

export type ScanStatus = 'clean' | 'infected' | 'error' | 'skipped';
export type ScanResult = { status: ScanStatus; signature?: string; engine?: 'clamscan'; raw?: string };

function isEnabled(): boolean {
  const v = (process.env.CLAM_ENABLED || '').toLowerCase();
  return v === '1' || v === 'true' || v === 'yes';
}

async function hasClamscan(): Promise<string | null> {
  const bin = process.env.CLAMSCAN_PATH || 'clamscan';
  return new Promise((resolve) => {
    const p = spawn('sh', ['-lc', `command -v ${bin} || which ${bin}`]);
    let out = '';
    p.stdout.on('data', (d) => (out += String(d)));
    p.on('close', (code) => resolve(code === 0 && out.trim() ? out.trim() : null));
    p.on('error', () => resolve(null));
  });
}

async function clamscanScan(buf: Buffer, timeoutMs: number): Promise<ScanResult> {
  const bin = await hasClamscan();
  if (!bin) return { status: 'skipped' };
  const tmp = path.join(process.env.TMPDIR || '/tmp', 'scan-' + randomBytes(6).toString('hex'));
  await fs.writeFile(tmp, buf);
  try {
    return await new Promise<ScanResult>((resolve) => {
      const p = spawn(bin, ['--no-summary', tmp], { stdio: ['ignore', 'pipe', 'pipe'] });
      let out = '';
      let err = '';
      const t = setTimeout(() => { try { p.kill('SIGKILL'); } catch { /* ignore */ } }, timeoutMs);
      p.stdout.on('data', (d) => (out += String(d)));
      p.stderr.on('data', (d) => (err += String(d)));
      p.on('close', () => {
        clearTimeout(t);
        const raw = (out || err).trim();
        if (/\bOK\b/i.test(raw)) return resolve({ status: 'clean', engine: 'clamscan', raw });
        const m = raw.match(/:\s*([^:\n]+)\s+FOUND/i);
        if (m) return resolve({ status: 'infected', signature: m[1], engine: 'clamscan', raw });
        return resolve({ status: 'error', raw });
      });
      p.on('error', () => resolve({ status: 'error' }));
    });
  } finally {
    try { await fs.unlink(tmp); } catch { /* ignore */ }
  }
}

export async function scanBuffer(buf: Buffer, opts?: { timeoutMs?: number }): Promise<ScanResult> {
  const timeoutMs = Math.max(5000, Math.min(60000, Number(process.env.CLAM_TIMEOUT_MS) || (opts?.timeoutMs ?? 10000)));
  if (!isEnabled()) return { status: 'skipped' };
  try {
    const csRes = await clamscanScan(buf, timeoutMs);
    if (csRes.status !== 'skipped') return csRes;
  } catch {
    // fall through
  }
  return { status: 'skipped' };
}

export async function scanText(text: string): Promise<ScanResult> {
  return scanBuffer(Buffer.from(text, 'utf8'));
}

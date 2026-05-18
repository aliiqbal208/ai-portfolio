import { execFile } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export type ScanResult = {
  status: 'clean' | 'infected' | 'error' | 'not_configured';
  signature?: string;
  engine?: string;
  raw?: string;
};

function which(cmd: string): Promise<string | null> {
  return new Promise((resolve) => {
    execFile('bash', ['-lc', ], (_err, stdout) => {
      const out = (stdout || '').toString().trim();
      resolve(out ? out : null);
    });
  });
}

export async function detectBins(): Promise<{ clamdscan?: string; clamscan?: string }> {
  if ((process.env.CLAMAV_DISABLE || '').trim() === '1') return {};
  const [clamdscan, clamscan] = await Promise.all([which('clamdscan'), which('clamscan')]);
  const result: { clamdscan?: string; clamscan?: string } = {};
  if (clamdscan) result.clamdscan = clamdscan;
  if (clamscan) result.clamscan = clamscan;
  return result;
}

export async function scanBuffer(buf: Buffer): Promise<ScanResult> {
  try {
    const bins = await detectBins();
    if (!bins.clamdscan && !bins.clamscan) {
      return { status: 'not_configured' };
    }

    const wd = mkdtempSync(join(tmpdir(), 'scan-'));
    const file = join(wd, 'payload.bin');
    try {
      writeFileSync(file, buf);
      const bin = bins.clamdscan || bins.clamscan!;
      const args = bins.clamdscan ? ['--fdpass', file] : ['--no-summary', file];

      const stdout = await new Promise<string>((resolve, reject) => {
        execFile(bin, args, { timeout: 60_000 }, (err: any, out, stderr) => {
          const raw = (out || stderr || '').toString();
          // clamscan exits 1 for FOUND, 0 for OK, >1 for errors
          if (err && typeof err.code === 'number' && err.code > 1) {
            reject(new Error(raw || String(err)));
            return;
          }
          resolve(raw);
        });
      });

      const raw = stdout.trim();
      const infectedMatch = raw.match(/:\s*([^:]+)\s+FOUND/m);
      if (infectedMatch) {
        return { status: 'infected', signature: infectedMatch[1].trim(), raw };
      }
      if (/OK/m.test(raw)) {
        return { status: 'clean', raw };
      }
      return /FOUND/.test(raw) ? { status: 'infected', raw } : { status: 'clean', raw };
    } finally {
      try { rmSync(wd, { recursive: true, force: true }); } catch {}
    }
  } catch (e: any) {
    return { status: 'error', raw: String(e?.message || e) };
  }
}

export async function scanText(text: string): Promise<ScanResult> {
  return scanBuffer(Buffer.from(text || '', 'utf8'));
}

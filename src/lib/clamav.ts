import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export type ClamAVDetect = {
  available: boolean;
  engine: 'clamdscan' | 'clamscan' | null;
  version: string | null;
  error?: string;
};

async function tryVersion(cmd: string, timeoutMs = 1500): Promise<{ ok: boolean; version?: string; error?: string }>{
  try {
    const { stdout } = await execFileAsync(cmd, ['--version'], { timeout: timeoutMs, windowsHide: true });
    const line = String(stdout || '').split(String.fromCharCode(10))[0]?.trim() || '';
    return { ok: true, version: line || undefined };
  } catch (err: any) {
    const code = err && (err.code || err.errno);
    if (code === 'ENOENT') return { ok: false };
    return { ok: false, error: String(err?.message || err) };
  }
}

export async function detectClamAV(): Promise<ClamAVDetect> {
  const clamd = await tryVersion('clamdscan');
  if (clamd.ok) return { available: true, engine: 'clamdscan', version: clamd.version || null };

  const clamscan = await tryVersion('clamscan');
  if (clamscan.ok) return { available: true, engine: 'clamscan', version: clamscan.version || null };

  return { available: false, engine: null, version: null, error: clamd.error || clamscan.error };
}

export type ScanResult = {
  ok: boolean;           // true if no infection found
  infected: boolean;     // true if infection(s) found
  details?: string;      // raw output summary
  engine: NonNullable<ClamAVDetect['engine']>;
  code: number;          // process exit code
};

export async function scanPath(path: string, opts?: { recursive?: boolean; timeoutMs?: number }): Promise<ScanResult> {
  const det = await detectClamAV();
  if (!det.available || !det.engine) throw new Error('ClamAV not available');
  const args: string[] = [];
  if (opts?.recursive) args.push('-r');
  if (det.engine === 'clamscan') args.push('--no-summary');
  args.push(path);
  try {
    const { stdout } = await execFileAsync(det.engine, args, { timeout: opts?.timeoutMs ?? 10000, windowsHide: true });
    const out = String(stdout || '').trim();
    return { ok: true, infected: false, details: out, engine: det.engine, code: 0 };
  } catch (err: any) {
    const code: number = typeof err?.code === 'number' ? err.code : (typeof err?.exitCode === 'number' ? err.exitCode : 2);
    const stdout = String(err?.stdout || '').trim();
    if (code === 1) {
      return { ok: false, infected: true, details: stdout, engine: det.engine, code };
    }
    throw new Error('ClamAV scan failed (code ' + String(code) + ')' + (stdout ? ': ' + stdout : ''));
  }
}

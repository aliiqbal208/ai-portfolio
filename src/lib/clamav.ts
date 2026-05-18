import net from 'node:net';
import { spawn } from 'node:child_process';

export type ScanEngine = 'clamd' | 'clamscan' | 'none';
export type ScanStatus = 'clean' | 'infected' | 'error' | 'skipped';

export interface ScanResult {
  engine: ScanEngine;
  status: ScanStatus;
  signature?: string;
  reason?: string;
  durationMs: number;
}

export interface ScanOptions {
  timeoutMs?: number;
  maxBytes?: number;
}

const DEFAULT_TIMEOUT = 8000; // 8s per backend
const DEFAULT_MAX_BYTES = 5 * 1024 * 1024; // 5 MB safety cap

function env(name: string, fallback: string): string {
  const v = process.env[name];
  return (v && v.trim()) || fallback;
}

async function clamdScan(buf: Buffer, opts: ScanOptions = {}): Promise<ScanResult> {
  const start = Date.now();
  const host = env('CLAMAV_HOST', env('CLAMD_HOST', '127.0.0.1'));
  const port = Number(env('CLAMAV_PORT', env('CLAMD_PORT', '3310')));
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT;

  return await new Promise<ScanResult>((resolve) => {
    const socket = net.createConnection({ host, port });
    let responded = false;
    const cleanup = () => {
      try { socket.destroy(); } catch {}
    };

    const onTimeout = () => {
      if (responded) return;
      responded = true;
      cleanup();
      resolve({ engine: 'clamd', status: 'skipped', reason: 'timeout', durationMs: Date.now() - start });
    };

    socket.setTimeout(timeoutMs, onTimeout);

    socket.once('error', () => {
      if (responded) return;
      responded = true;
      cleanup();
      resolve({ engine: 'clamd', status: 'skipped', reason: 'unavailable', durationMs: Date.now() - start });
    });

    socket.once('connect', () => {
      // INSTREAM protocol: https://linux.die.net/man/8/clamd
      const header = Buffer.from('INSTREAM
', 'utf8');
      socket.write(header);
      // Send in 64KB chunks with 4-byte length prefix (big-endian)
      const CHUNK = 64 * 1024;
      for (let i = 0; i < buf.length; i += CHUNK) {
        const slice = buf.slice(i, Math.min(i + CHUNK, buf.length));
        const len = Buffer.alloc(4);
        len.writeUInt32BE(slice.length, 0);
        socket.write(len);
        socket.write(slice);
      }
      // zero-length chunk to signal EOF
      const endLen = Buffer.alloc(4);
      endLen.writeUInt32BE(0, 0);
      socket.write(endLen);
    });

    let resp = Buffer.alloc(0);
    socket.on('data', (chunk) => {
      resp = Buffer.concat([resp, chunk]);
    });

    socket.on('end', () => {
      if (responded) return;
      responded = true;
      const text = resp.toString('utf8').trim();
      const durationMs = Date.now() - start;
      if (!text) {
        resolve({ engine: 'clamd', status: 'error', reason: 'empty_response', durationMs });
        return;
      }
      if (/OK/i.test(text)) {
        resolve({ engine: 'clamd', status: 'clean', durationMs });
        return;
      }
      const found = /^(?:.*?):\s*(.*?)\s*FOUND\s*$/i.exec(text);
      if (found && found[1]) {
        resolve({ engine: 'clamd', status: 'infected', signature: found[1], durationMs });
        return;
      }
      resolve({ engine: 'clamd', status: 'error', reason: text, durationMs });
    });
  });
}

async function clamscanScan(buf: Buffer, opts: ScanOptions = {}): Promise<ScanResult> {
  const start = Date.now();
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT;

  return await new Promise<ScanResult>((resolve) => {
    const child = spawn('clamscan', ['-', '--no-summary']);
    let out = '';
    let err = '';
    let finished = false;

    const done = (result: ScanResult) => {
      if (finished) return; finished = true; resolve(result);
    };

    child.stdout.on('data', (d) => { out += String(d); });
    child.stderr.on('data', (d) => { err += String(d); });
    child.on('error', () => {
      done({ engine: 'clamscan', status: 'skipped', reason: 'unavailable', durationMs: Date.now() - start });
    });

    const timer = setTimeout(() => {
      try { child.kill('SIGKILL'); } catch {}
      done({ engine: 'clamscan', status: 'skipped', reason: 'timeout', durationMs: Date.now() - start });
    }, timeoutMs);

    child.on('close', (code) => {
      clearTimeout(timer);
      const durationMs = Date.now() - start;
      const text = (out || err || '').trim();
      if (code === 0 && /:\s*OK/i.test(text)) {
        done({ engine: 'clamscan', status: 'clean', durationMs });
      } else if (typeof code === 'number' && code > 0 && /:\s*.*FOUND/i.test(text)) {
        const sig = text.replace(/^.*?:\s*/,'').replace(/\s*FOUND\s*$/i,'');
        done({ engine: 'clamscan', status: 'infected', signature: sig, durationMs });
      } else if (/not found|command not found|no such file/i.test(text)) {
        done({ engine: 'clamscan', status: 'skipped', reason: 'unavailable', durationMs });
      } else {
        done({ engine: 'clamscan', status: 'error', reason: text || , durationMs });
      }
    });

    try {
      child.stdin.write(buf);
      child.stdin.end();
    } catch {
      done({ engine: 'clamscan', status: 'skipped', reason: 'stdin_error', durationMs: Date.now() - start });
    }
  });
}

export async function scanBuffer(
  input: Buffer,
  opts: ScanOptions = {}
): Promise<ScanResult> {
  const maxBytes = opts.maxBytes ?? DEFAULT_MAX_BYTES;
  if (input.byteLength === 0) {
    return { engine: 'none', status: 'skipped', reason: 'empty_input', durationMs: 0 };
  }
  if (input.byteLength > maxBytes) {
    return { engine: 'none', status: 'skipped', reason: 'too_large', durationMs: 0 };
  }

  const viaClamd = await clamdScan(input, opts);
  if (viaClamd.status !== 'skipped') return viaClamd;

  const viaCli = await clamscanScan(input, opts);
  if (viaCli.status !== 'skipped') return viaCli;

  return { engine: 'none', status: 'skipped', reason: viaCli.reason || viaClamd.reason || 'no_engine', durationMs: (viaClamd.durationMs || 0) + (viaCli.durationMs || 0) };
}

export async function detectAvailability(): Promise<{ clamd: boolean; clamscan: boolean }>{
  const host = env('CLAMAV_HOST', env('CLAMD_HOST', '127.0.0.1'));
  const port = Number(env('CLAMAV_PORT', env('CLAMD_PORT', '3310')));
  const canClamd = await new Promise<boolean>((resolve) => {
    const sock = net.createConnection({ host, port });
    let settled = false;
    const finish = (v: boolean) => { if (!settled) { settled = true; try { sock.destroy(); } catch {}; resolve(v); } };
    sock.setTimeout(500, () => finish(false));
    sock.once('error', () => finish(false));
    sock.once('connect', () => finish(true));
  });

  const canCli = await new Promise<boolean>((resolve) => {
    const p = spawn('clamscan', ['--version']);
    let ok = false;
    p.on('error', () => resolve(false));
    p.stdout.on('data', (d) => { if (String(d).toLowerCase().includes('clam')) ok = true; });
    p.on('close', (code) => resolve(ok || code === 0));
  });

  return { clamd: canClamd, clamscan: canCli };
}

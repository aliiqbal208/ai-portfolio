import net from 'node:net';
import { execFile } from 'node:child_process';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';

export type ScanStatus = 'clean' | 'infected' | 'error' | 'unavailable';
export type Engine = 'clamd' | 'clamscan' | 'none';
export interface ScanResult {
  engine: Engine;
  status: ScanStatus;
  signature?: string;
  raw?: string;
}

function env(name: string, def: string): string { return process.env[name] || def; }

async function scanWithClamd(buffer: Buffer, timeoutMs = 8000): Promise<ScanResult> {
  const host = env('CLAMAV_HOST', '127.0.0.1');
  const port = Number(env('CLAMAV_PORT', '3310')) || 3310;
  return new Promise<ScanResult>((resolve, reject) => {
    const socket = new net.Socket();
    const chunks: Buffer[] = [];
    let settled = false;

    const onFail = (err?: Error) => {
      if (settled) return;
      settled = true;
      try { socket.destroy(); } catch {}
      reject(err || new Error('clamd connection failed'));
    };

    const timer = setTimeout(() => onFail(new Error('clamd timeout')), timeoutMs).unref();

    socket.once('error', onFail);
    socket.connect(port, host, () => {
      socket.write('zINSTREAM\n');
      // Send data in 8KB chunks, each prefixed with 4-byte length (big-endian)
      const CHUNK = 8 * 1024;
      for (let i = 0; i < buffer.length; i += CHUNK) {
        const slice = buffer.subarray(i, i + CHUNK);
        const header = Buffer.alloc(4);
        header.writeUInt32BE(slice.length, 0);
        socket.write(header);
        socket.write(slice);
      }
      // zero-length chunk indicates EOF
      const endHeader = Buffer.alloc(4);
      endHeader.writeUInt32BE(0, 0);
      socket.write(endHeader);
    });

    socket.on('data', (d: Buffer) => chunks.push(d));
    socket.on('end', () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      const raw = Buffer.concat(chunks).toString('utf8').trim();
      // Expected: 'stream: OK' or 'stream: Eicar-Test-Signature FOUND'
      const m = raw.match(/stream:\s+(.+?)(?:\s+FOUND|\s+OK)/i);
      const signature = m && !/ok/i.test(m[1]) ? m[1] : undefined;
      const infected = /\bFOUND\b/i.test(raw);
      resolve({ engine: 'clamd', status: infected ? 'infected' : 'clean', signature, raw });
    });
  });
}

async function scanWithClamscan(buffer: Buffer, timeoutMs = 12000): Promise<ScanResult> {
  const dir = tmpdir();
  const file = path.join(dir, );
  await fs.writeFile(file, buffer);
  return new Promise<ScanResult>((resolve, reject) => {
    const args = ['--stdout', '--no-summary', file];
    const proc = execFile('clamscan', args, { timeout: timeoutMs }, (err, stdout, stderr) => {
      try { fs.unlink(file).catch(() => {}); } catch {}
      const raw = (stdout || stderr || '').toString();
      if ((err as any)?.code === 'ENOENT') {
        // clamscan not installed
        return reject(Object.assign(new Error('clamscan not found'), { code: 'ENOENT' }));
      }
      if (err && (err as any).killed) {
        return reject(new Error('clamscan timeout'));
      }
      // clamscan returns 0 for OK, 1 for FOUND, 2 for error
      const exitCode = (err && typeof (err as any).code === 'number') ? (err as any).code : 0;
      const infected = exitCode === 1 || /FOUND/i.test(raw);
      const m = raw.match(/:[\s]+(.+?)\s+FOUND/i);
      const signature = infected && m ? m[1] : undefined;
      if (exitCode === 2) {
        resolve({ engine: 'clamscan', status: 'error', raw });
      } else {
        resolve({ engine: 'clamscan', status: infected ? 'infected' : 'clean', signature, raw });
      }
    });
    proc.on('error', (e: any) => {
      reject(e);
    });
  });
}

export async function scanBuffer(buffer: Buffer): Promise<ScanResult> {
  // Try clamd first, then clamscan. Never throw; return best-effort status.
  try {
    const r = await scanWithClamd(buffer);
    return r;
  } catch {}
  try {
    const r = await scanWithClamscan(buffer);
    return r;
  } catch (e: any) {
    const code = e && typeof e === 'object' ? (e as any).code : undefined;
    if (code === 'ENOENT') {
      return { engine: 'none', status: 'unavailable' };
    }
    return { engine: 'none', status: 'error', raw: String(e) };
  }
}

export async function scanString(text: string): Promise<ScanResult> {
  const buf = Buffer.from(text, 'utf8');
  return scanBuffer(buf);
}

export async function isEngineAvailable(): Promise<{ clamd: boolean; clamscan: boolean }> {
  // Check clamd by attempting a short connect
  const clamd = await new Promise<boolean>((resolve) => {
    const host = env('CLAMAV_HOST', '127.0.0.1');
    const port = Number(env('CLAMAV_PORT', '3310')) || 3310;
    const socket = new net.Socket();
    let settled = false;
    const done = (ok: boolean) => {
      if (settled) return; settled = true; try { socket.destroy(); } catch {}; resolve(ok);
    };
    socket.setTimeout(1000, () => done(false));
    socket.once('error', () => done(false));
    socket.connect(port, host, () => done(true));
  });

  const clamscan = await new Promise<boolean>((resolve) => {
    const p = execFile('clamscan', ['-V'], { timeout: 2000 }, (err) => {
      if ((err as any)?.code === 'ENOENT') return resolve(false);
      resolve(true);
    });
    p.on('error', () => resolve(false));
  });

  return { clamd, clamscan };
}

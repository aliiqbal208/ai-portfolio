import * as net from 'net';
import { spawn } from 'child_process';

export type ClamScanResult = {
  status: 'clean' | 'infected' | 'unavailable' | 'error';
  signature?: string;
  engine?: 'clamd' | 'clamscan';
  details?: string;
};

export type ClamScanOptions = {
  host?: string; // CLAMAV_HOST
  port?: number; // CLAMAV_PORT (default 3310)
  socketPath?: string; // CLAMAV_SOCKET
  timeoutMs?: number; // default 5000
  clamscanPath?: string; // CLAMAV_CLAMSCAN_PATH
};

function parseClamReply(text: string): { status: 'clean' | 'infected' | 'error'; signature?: string } {
  const line = (text || '').trim();
  if (/\bOK\b$/i.test(line)) return { status: 'clean' };
  const m = line.match(/:\s*(.+)\s+FOUND$/i);
  if (m) return { status: 'infected', signature: m[1] };
  return { status: 'error' };
}

async function scanWithClamd(buffer: Buffer, opts: ClamScanOptions): Promise<ClamScanResult> {
  const { host, port, socketPath, timeoutMs = 5000 } = opts || {};
  const target: string = socketPath || ;
  return await new Promise((resolve) => {
    let replied = false;
    const client = socketPath ? net.createConnection(socketPath) : net.createConnection({ host: host || '127.0.0.1', port: port || 3310 });
    const timer = setTimeout(() => {
      if (!replied) {
        replied = true;
        try { client.destroy(); } catch {}
        resolve({ status: 'unavailable', engine: 'clamd', details:  });
      }
    }, timeoutMs);

    client.on('error', (err) => {
      if (replied) return;
      replied = true;
      clearTimeout(timer);
      resolve({ status: 'unavailable', engine: 'clamd', details: (err && (err as any).message) || 'connect error' });
    });

    let response = '';
    client.on('data', (chunk) => { response += String(chunk); });
    client.on('end', () => {
      if (replied) return;
      replied = true;
      clearTimeout(timer);
      const parsed = parseClamReply(response);
      resolve({ status: parsed.status, signature: parsed.signature, engine: 'clamd' });
    });

    client.on('connect', () => {
      try {
        client.write('INSTREAM\n');
        const CHUNK = 16 * 1024;
        for (let i = 0; i < buffer.length; i += CHUNK) {
          const slice = buffer.subarray(i, Math.min(i + CHUNK, buffer.length));
          const len = Buffer.allocUnsafe(4);
          len.writeUInt32BE(slice.length, 0);
          client.write(len);
          client.write(slice);
        }
        const zero = Buffer.alloc(4); zero.writeUInt32BE(0, 0);
        client.write(zero);
        client.end();
      } catch (err) {
        if (replied) return;
        replied = true;
        clearTimeout(timer);
        resolve({ status: 'error', engine: 'clamd', details: (err && (err as any).message) || 'stream error' });
      }
    });
  });
}

async function scanWithClamscan(buffer: Buffer, opts: ClamScanOptions): Promise<ClamScanResult> {
  const bin = (opts && opts.clamscanPath) || 'clamscan';
  return await new Promise((resolve) => {
    try {
      const proc = spawn(bin, ['--no-summary', '-']);
      let out = '';
      let err = '';
      proc.stdout.on('data', (d) => { out += String(d); });
      proc.stderr.on('data', (d) => { err += String(d); });
      proc.on('error', (e) => resolve({ status: 'unavailable', engine: 'clamscan', details: e?.message || 'spawn error' }));
      proc.on('close', (code) => {
        const parsed = parseClamReply(out.replace(/^stdin/i, 'stream'));
        if (code === 0) return resolve({ status: 'clean', engine: 'clamscan' });
        if (code === 1 && parsed.status === 'infected') return resolve({ status: 'infected', signature: parsed.signature, engine: 'clamscan' });
        resolve({ status: 'error', engine: 'clamscan', details: err || out ||  });
      });
      proc.stdin.write(buffer);
      proc.stdin.end();
    } catch (e: any) {
      resolve({ status: 'unavailable', engine: 'clamscan', details: e?.message || 'exec error' });
    }
  });
}

export async function scanBufferWithClamAV(buffer: Buffer, options: ClamScanOptions = {}): Promise<ClamScanResult> {
  const viaClamd = await scanWithClamd(buffer, options);
  if (viaClamd.status !== 'unavailable') return viaClamd;
  return await scanWithClamscan(buffer, options);
}

export function envOptions(): ClamScanOptions {
  const host = process.env.CLAMAV_HOST;
  const port = process.env.CLAMAV_PORT ? Number(process.env.CLAMAV_PORT) : undefined;
  const socketPath = process.env.CLAMAV_SOCKET;
  const clamscanPath = process.env.CLAMAV_CLAMSCAN_PATH;
  const timeoutMs = process.env.CLAMAV_TIMEOUT_MS ? Number(process.env.CLAMAV_TIMEOUT_MS) : undefined;
  return { host, port, socketPath, clamscanPath, timeoutMs };
}
TS}

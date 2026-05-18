import * as net from 'net'

export type ClamScanResult = {
  ok: boolean;
  raw: string;
  signature?: string;
};

const DEFAULT_HOST = process.env.CLAMAV_HOST || '127.0.0.1';
const DEFAULT_PORT = Number(process.env.CLAMAV_PORT || 3310);
const ENABLED = (process.env.CLAMAV_ENABLED || '').toLowerCase() in { '1':1, 'true':1, 'yes':1, 'on':1 };
const TIMEOUT_MS = Number(process.env.CLAMAV_TIMEOUT_MS || 2000);

export function isEnabled() {
  return ENABLED;
}

function connect() {
  return new Promise<net.Socket>((resolve, reject) => {
    const socket = net.createConnection({ host: DEFAULT_HOST, port: DEFAULT_PORT }, () => resolve(socket));
    socket.setTimeout(TIMEOUT_MS, () => {
      socket.destroy(new Error('timeout'));
    });
    socket.on('error', (err) => reject(err));
  });
}

export async function ping(): Promise<boolean> {
  if (!ENABLED) return false;
  try {
    const socket = await connect();
    const resp = await new Promise<string>((resolve, reject) => {
      let data = Buffer.alloc(0);
      socket.once('error', reject);
      socket.on('data', (chunk) => { data = Buffer.concat([data, chunk]); });
      socket.on('close', () => resolve(data.toString('utf8')));
      socket.write('PING
');
      socket.end();
    });
    return resp.trim().toUpperCase().includes('PONG');
  } catch {
    return false;
  }
}

export async function version(): Promise<string | null> {
  if (!ENABLED) return null;
  try {
    const socket = await connect();
    const resp = await new Promise<string>((resolve, reject) => {
      let data = Buffer.alloc(0);
      socket.once('error', reject);
      socket.on('data', (chunk) => { data = Buffer.concat([data, chunk]); });
      socket.on('close', () => resolve(data.toString('utf8')));
      socket.write('VERSION
');
      socket.end();
    });
    return resp.trim() || null;
  } catch {
    return null;
  }
}

export async function instreamScan(buffer: Buffer): Promise<ClamScanResult> {
  if (!ENABLED) {
    return { ok: false, raw: 'CLAMAV_DISABLED' };
  }
  const max = Number(process.env.CLAMAV_MAX_BYTES || 5 * 1024 * 1024);
  if (buffer.length > max) {
    return { ok: false, raw: 'PAYLOAD_TOO_LARGE' };
  }
  const chunkSize = 8192;
  try {
    const socket = await connect();
    const result = await new Promise<ClamScanResult>((resolve, reject) => {
      let collected = Buffer.alloc(0);
      socket.once('error', reject);
      socket.on('data', (chunk) => { collected = Buffer.concat([collected, chunk]); });
      socket.on('close', () => {
        const txt = collected.toString('utf8').trim();
        const up = txt.toUpperCase();
        if (up.endsWith('OK')) {
          resolve({ ok: true, raw: txt });
        } else if (up.includes('FOUND')) {
          const sig = txt.split(':').slice(1).join(':').replace('FOUND', '').trim();
          resolve({ ok: false, raw: txt, signature: sig });
        } else {
          resolve({ ok: false, raw: txt });
        }
      });
      socket.write('INSTREAM
');
      let offset = 0;
      while (offset < buffer.length) {
        const end = Math.min(offset + chunkSize, buffer.length);
        const chunk = buffer.subarray(offset, end);
        const len = Buffer.alloc(4);
        len.writeUInt32BE(chunk.length, 0);
        socket.write(len);
        socket.write(chunk);
        offset = end;
      }
      const zero = Buffer.alloc(4);
      zero.writeUInt32BE(0, 0);
      socket.write(zero);
      socket.end();
    });
    return result;
  } catch (err: any) {
    return { ok: false, raw: String(err?.message || err || 'UNKNOWN_ERROR') };
  }
}

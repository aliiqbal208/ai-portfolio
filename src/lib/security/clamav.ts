import { Socket } from 'net';
import fs from 'fs';

export type ClamResult = {
  ok: boolean;
  isInfected: boolean;
  signature?: string;
  raw: string;
  durationMs: number;
};

const CLAMAV_ENABLED = String(process.env.CLAMAV_ENABLED || 'false').toLowerCase() === 'true';
const CLAMAV_HOST = process.env.CLAMAV_HOST || '127.0.0.1';
const CLAMAV_PORT = Number(process.env.CLAMAV_PORT || 3310);
const CLAMAV_TIMEOUT_MS = Number(process.env.CLAMAV_TIMEOUT_MS || 5000);
const CHUNK_BYTES = Math.max(1024, Number(process.env.CLAMAV_CHUNK_BYTES || 131072));

export function isEnabled(): boolean { return CLAMAV_ENABLED; }

function connect(): Promise<Socket> {
  return new Promise((res, rej) => {
    const s = new Socket();
    s.setTimeout(CLAMAV_TIMEOUT_MS);
    s.once('error', rej);
    s.connect(CLAMAV_PORT, CLAMAV_HOST, () => { s.removeListener('error', rej); res(s); });
  });
}

function sendLine(s: Socket, line: string) { s.write(line.endsWith('
') ? line : line + '
'); }

export async function ping(): Promise<{ ok: boolean; raw: string } | { ok: false; disabled: true }> {
  if (!CLAMAV_ENABLED) return { ok: false, disabled: true } as const;
  const s = await connect();
  return new Promise((resolve) => {
    let data = '';
    const cleanup = () => { try { s.end(); } catch {} };
    s.on('data', (chunk) => { data += chunk.toString('utf-8'); });
    s.on('timeout', () => { cleanup(); resolve({ ok: false, raw: 'timeout' }); });
    s.on('error', (err: any) => { cleanup(); resolve({ ok: false, raw: 'error:' + (err?.message || String(err)) }); });
    s.on('end', () => { cleanup(); resolve({ ok: data.includes('PONG'), raw: data.trim() }); });
    sendLine(s, 'PING');
  });
}

export async function scanBuffer(buf: Buffer): Promise<ClamResult | { ok: false, disabled: true }> {
  if (!CLAMAV_ENABLED) return { ok: false, disabled: true } as const;
  const started = Date.now();
  const s = await connect();
  return new Promise((resolve) => {
    let response = '';
    const cleanup = () => { try { s.end(); } catch {} };

    s.on('data', (ch) => { response += ch.toString('utf-8'); });
    s.on('timeout', () => { cleanup(); resolve({ ok: false, isInfected: false, raw: 'timeout', durationMs: Date.now() - started }); });
    s.on('error', (err: any) => { cleanup(); resolve({ ok: false, isInfected: false, raw: 'error:' + (err?.message || String(err)), durationMs: Date.now() - started }); });
    s.on('end', () => {
      const raw = response.trim();
      const isInfected = /FOUND$/.test(raw);
      const signature = isInfected ? (raw.split(':')[1] || '').replace(/\s*FOUND$/, '').trim() : undefined;
      resolve({ ok: true, isInfected, signature, raw, durationMs: Date.now() - started });
    });

    // INSTREAM handshake per clamd protocol
    sendLine(s, 'INSTREAM');

    // Send buffer in chunks with 4-byte big-endian length prefix
    let offset = 0;
    while (offset < buf.length) {
      const n = Math.min(CHUNK_BYTES, buf.length - offset);
      const chunk = buf.subarray(offset, offset + n);
      const header = Buffer.alloc(4);
      header.writeUInt32BE(chunk.length, 0);
      s.write(header);
      s.write(chunk);
      offset += n;
    }
    // Terminate stream with 0 length
    const zero = Buffer.alloc(4);
    zero.writeUInt32BE(0, 0);
    s.write(zero);
  });
}

export async function scanFile(filePath: string): Promise<ClamResult | { ok: false; disabled: true; error?: string }> {
  try {
    const st = fs.statSync(filePath);
    if (!st.isFile()) return { ok: false, disabled: false as any, error: 'not a file' } as any;
  } catch (e: any) {
    return { ok: false, disabled: false as any, error: e?.message || 'stat failed' } as any;
  }
  const buf = fs.readFileSync(filePath);
  return scanBuffer(buf) as any;
}

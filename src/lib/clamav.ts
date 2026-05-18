import net from 'net';
import crypto from 'crypto';
import { Readable } from 'stream';

export type ScanStatus = 'clean' | 'infected' | 'error' | 'skipped';
export type ScanResult = {
  status: ScanStatus;
  signature?: string;
  reason?: string;
  durationMs: number;
  cacheHit?: boolean;
  bytesScanned?: number;
};

class LruCache<K, V> {
  private max: number;
  private store: Map<K, { value: V; expiresAt: number }>;
  private ttlMs: number;
  constructor(max = 512, ttlMs = 5 * 60 * 1000) {
    this.max = Math.max(8, max);
    this.ttlMs = Math.max(1000, ttlMs);
    this.store = new Map();
  }
  get(key: K): V | undefined {
    const entry = this.store.get(key);
    const now = Date.now();
    if (!entry) return undefined;
    if (entry.expiresAt < now) { this.store.delete(key); return undefined; }
    this.store.delete(key); this.store.set(key, entry);
    return entry.value;
  }
  set(key: K, value: V) {
    if (this.store.size >= this.max) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey !== undefined) this.store.delete(oldestKey);
    }
    this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }
}

const CACHE_MAX = parseInt(process.env.CLAMAV_CACHE_MAX || '256', 10) || 256;
const CACHE_TTL = parseInt(process.env.CLAMAV_CACHE_TTL_MS || String(5 * 60_000), 10) || 5 * 60_000;
const SKIP_LARGE_BYTES = parseInt(process.env.CLAMAV_SKIP_LARGE_BYTES || '0', 10) || 0;
const HOST = process.env.CLAMAV_HOST || '';
const PORT = parseInt(process.env.CLAMAV_PORT || '3310', 10) || 3310;
const TIMEOUT_MS = parseInt(process.env.CLAMAV_TIMEOUT_MS || '5000', 10) || 5000;

const resultCache = new LruCache<string, ScanResult>(CACHE_MAX, CACHE_TTL);

function parseClamdReply(text: string): { status: ScanStatus; signature?: string } {
  const line = (text || '').trim();
  if (!line) return { status: 'error' };
  if (line.endsWith('OK')) return { status: 'clean' };
  const idx = line.lastIndexOf(' FOUND');
  if (idx !== -1) {
    const before = line.slice(0, idx);
    const parts = before.split(':');
    const sig = parts[parts.length - 1]?.trim() || 'unknown';
    return { status: 'infected', signature: sig };
  }
  return { status: 'error' };
}

async function scanStream(stream: Readable): Promise<ScanResult> {
  const start = Date.now();
  if (!HOST) {
    return { status: 'skipped', reason: 'clamd not configured', durationMs: 0, bytesScanned: 0 } as ScanResult;
  }
  return new Promise<ScanResult>((resolve) => {
    const socket = new net.Socket();
    let resolved = false;
    let sentBytes = 0;
    const finish = (res: ScanResult) => {
      if (resolved) return;
      resolved = true;
      try { socket.destroy(); } catch {}
      res.durationMs = Date.now() - start;
      resolve(res);
    };

    socket.setTimeout(TIMEOUT_MS, () => finish({ status: 'error', reason: 'timeout', durationMs: 0, bytesScanned: sentBytes } as ScanResult));
    socket.on('error', (err) => finish({ status: 'error', reason: (err as any)?.message || 'socket_error', durationMs: 0, bytesScanned: sentBytes } as ScanResult));

    socket.connect(PORT, HOST, () => {
      try { socket.write('INSTREAM\n', 'utf8'); } catch {}
      const lenBuf = Buffer.allocUnsafe(4);
      const hasher = crypto.createHash('sha256');

      const onData = (chunk: any) => {
        const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        if (SKIP_LARGE_BYTES && (sentBytes + buf.length) > SKIP_LARGE_BYTES) {
          stream.off('data', onData); stream.off('end', onEnd);
          try { lenBuf.writeUInt32BE(0, 0); socket.write(lenBuf); } catch {}
          finish({ status: 'skipped', reason: 'size_limit', durationMs: 0, bytesScanned: sentBytes } as ScanResult);
          return;
        }
        hasher.update(buf);
        lenBuf.writeUInt32BE(buf.length, 0);
        socket.write(lenBuf); socket.write(buf);
        sentBytes += buf.length;
      };
      const onEnd = () => { try { lenBuf.writeUInt32BE(0, 0); socket.write(lenBuf); } catch {} };

      let reply = '';
      socket.on('data', (b) => { reply += b.toString('utf8'); });
      socket.on('close', () => {
        const parsed = parseClamdReply(reply);
        const key = hasher.digest('hex');
        const result: ScanResult = { ...parsed, durationMs: Date.now() - start, bytesScanned: sentBytes } as ScanResult;
        resultCache.set(key, result);
        finish(result);
      });

      stream.on('data', onData);
      stream.on('end', onEnd);
      stream.on('error', (err) => finish({ status: 'error', reason: (err as any)?.message || 'stream_error', durationMs: 0, bytesScanned: 0 } as ScanResult));
    });
  });
}

export async function scanBuffer(buffer: Buffer): Promise<ScanResult> {
  const hash = crypto.createHash('sha256').update(buffer).digest('hex');
  const cached = resultCache.get(hash);
  if (cached) return { ...cached, cacheHit: true };
  const readable = Readable.from(buffer);
  const res = await scanStream(readable);
  res.bytesScanned = buffer.length;
  resultCache.set(hash, res);
  return res;
}

export async function scanFile(path: string): Promise<ScanResult> {
  const fs = await import('fs');
  const stat = await fs.promises.stat(path).catch(() => null);
  if (!stat) return { status: 'error', reason: 'file_not_found', durationMs: 0 } as ScanResult;
  const hasher = crypto.createHash('sha256');
  const rs = fs.createReadStream(path);
  let total = 0;
  await new Promise<void>((resolve, reject) => {
    rs.on('data', (chunk) => { hasher.update(chunk as Buffer); total += (chunk as Buffer).length; });
    rs.on('end', resolve);
    rs.on('error', reject);
  }).catch(() => {});
  const key = hasher.digest('hex');
  const cached = resultCache.get(key);
  if (cached) return { ...cached, cacheHit: true };
  const rs2 = fs.createReadStream(path);
  const res = await scanStream(rs2 as unknown as Readable);
  res.bytesScanned = total;
  resultCache.set(key, res);
  return res;
}

export function isConfigured(): boolean { return Boolean(HOST); }

export default { scanBuffer, scanFile, isConfigured };

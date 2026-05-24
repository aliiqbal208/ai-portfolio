import * as net from 'node:net';
import { Readable } from 'node:stream';

export type ClamAVMode = 'unix' | 'tcp';

export interface ClamAVConfig {
  socketPath?: string | null;
  host?: string | null;
  port?: number | null;
  // Max bytes to stream to clamd; files larger are truncated
  maxBytes?: number;
  // Chunk size sent over INSTREAM (<= 1<<24 - 1 per clamd docs)
  chunkSize?: number;
  // Connection/IO timeout in ms
  timeoutMs?: number;
}

export interface ScanResult {
  status: 'clean' | 'infected' | 'error' | 'skipped';
  signature?: string;
  bytesScanned: number;
  durationMs: number;
  engine?: string;
  error?: string;
  mode?: ClamAVMode | null;
}

function envInt(name: string, def: number): number {
  const v = process.env[name];
  if (!v) return def;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : def;
}

export function loadConfig(): { cfg: ClamAVConfig; mode: ClamAVMode | null } {
  const socketPath = process.env.CLAMAV_SOCKET || process.env.CLAMD_SOCKET || '';
  const host = process.env.CLAMAV_HOST || process.env.CLAMD_HOST || '';
  const portStr = process.env.CLAMAV_PORT || process.env.CLAMD_PORT || '';
  const port = portStr ? Number(portStr) : undefined;
  const timeoutMs = envInt('CLAMAV_TIMEOUT_MS', 8_000);
  const maxBytes = envInt('CLAMAV_MAX_BYTES', 25 * 1024 * 1024); // 25 MiB default
  const chunkSize = envInt('CLAMAV_CHUNK_SIZE', 64 * 1024); // 64 KiB safe default

  if (socketPath) {
    return { cfg: { socketPath, timeoutMs, maxBytes, chunkSize }, mode: 'unix' };
  }
  if (host && port && Number.isFinite(port)) {
    return { cfg: { host, port, timeoutMs, maxBytes, chunkSize }, mode: 'tcp' };
  }
  return { cfg: { timeoutMs, maxBytes, chunkSize }, mode: null };
}

function connect(cfg: ClamAVConfig, mode: ClamAVMode): Promise<net.Socket> {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    socket.setTimeout(cfg.timeoutMs ?? 8_000, () => {
      socket.destroy(new Error('clamd timeout'));
    });
    const onError = (err: Error) => reject(err);
    socket.once('error', onError);
    socket.once('connect', () => {
      socket.off('error', onError);
      resolve(socket);
    });
    if (mode === 'unix') {
      socket.connect(cfg.socketPath!);
    } else {
      socket.connect(cfg.port!, cfg.host!);
    }
  });
}

export async function ping(): Promise<{ ok: boolean; mode: ClamAVMode | null; error?: string }>{
  const { cfg, mode } = loadConfig();
  if (!mode) return { ok: false, mode: null, error: 'not_configured' };
  try {
    const sock = await connect(cfg, mode);
    await new Promise<void>((resolve, reject) => {
      // Prefer null-terminated command variant for clamd
      sock.write('zPING\x00');
      let data = '';
      const onData = (buf: Buffer) => {
        data += buf.toString('utf8');
        if (data.includes('PONG')) {
          sock.end();
          sock.off('data', onData);
          resolve();
        }
      };
      sock.on('data', onData);
      sock.once('error', reject);
      sock.once('close', () => resolve());
    });
    return { ok: true, mode };
  } catch (err: any) {
    return { ok: false, mode, error: err?.message || String(err) };
  }
}

export async function scanStream(stream: Readable, opts?: Partial<ClamAVConfig>): Promise<ScanResult> {
  const start = Date.now();
  const { cfg: base, mode } = loadConfig();
  const cfg: ClamAVConfig = { ...base, ...(opts || {}) };
  if (!mode) {
    return { status: 'skipped', bytesScanned: 0, durationMs: Date.now() - start, error: 'not_configured', mode: null };
  }

  const maxBytes = cfg.maxBytes ?? 25 * 1024 * 1024;
  const chunkSize = Math.max(1, Math.min(cfg.chunkSize ?? 64 * 1024, (1 << 24) - 1));

  let sock: net.Socket | null = null;
  let scanned = 0;
  try {
    sock = await connect(cfg, mode);

    const writeChunk = (buf: Buffer) => new Promise<void>((resolve, reject) => {
      const header = Buffer.alloc(4);
      header.writeUInt32BE(buf.length, 0);
      sock!.write(header);
      sock!.write(buf, (err) => (err ? reject(err) : resolve()));
    });

    await new Promise<void>((resolve, reject) => {
      sock!.once('error', reject);
      // Use null-terminated INSTREAM for best compatibility
      sock!.write('zINSTREAM\x00');

      const onData = async (chunk: Buffer) => {
        scanned += chunk.length;
        if (scanned > maxBytes) {
          stream.off('data', onData);
          stream.pause();
          const zero = Buffer.alloc(4);
          sock!.write(zero);
          resolve();
          return;
        }
        for (let i = 0; i < chunk.length; i += chunkSize) {
          const piece = chunk.subarray(i, i + chunkSize);
          try {
            await writeChunk(piece);
          } catch (e) {
            reject(e as any);
            return;
          }
        }
      };
      stream.on('data', onData);
      stream.once('end', () => {
        const zero = Buffer.alloc(4);
        sock!.write(zero);
        resolve();
      });
      stream.once('error', reject);
    });

    const resp: string = await new Promise((resolve, reject) => {
      let buf = '';
      const onData = (chunk: Buffer) => {
        buf += chunk.toString('utf8');
        if (buf.includes('\n') || /\b(OK|FOUND)\b/.test(buf)) {
          sock!.off('data', onData);
          resolve(buf);
        }
      };
      sock!.on('data', onData);
      sock!.once('error', reject);
      sock!.once('end', () => resolve(buf));
    });
    sock.end();

    const m = resp.match(/stream: (?:(.+) FOUND|OK)/);
    if (m && m[1]) {
      return { status: 'infected', signature: m[1], bytesScanned: scanned, durationMs: Date.now() - start, mode };
    }
    return { status: 'clean', bytesScanned: scanned, durationMs: Date.now() - start, mode };
  } catch (err: any) {
    try { sock && sock.destroy(); } catch {}
    return {
      status: 'error',
      error: err?.message || String(err),
      bytesScanned: scanned,
      durationMs: Date.now() - start,
      mode,
    };
  }
}

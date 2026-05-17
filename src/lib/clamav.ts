/* Minimal ClamAV (clamd) client for Node runtimes.
 * - Attempts to stream-scan a Buffer to clamd using INSTREAM.
 * - Gracefully reports 'unavailable' when CLAMAV_HOST is not configured.
 * - Enforces a max payload size via CLAMAV_MAX_BYTES (default 5 MiB).
 */

import net from 'node:net'

export type ScanStatus = 'clean' | 'infected' | 'error' | 'unavailable';
export interface ScanResult {
  status: ScanStatus;
  signature?: string;
  raw?: string;
}

export interface ClamOptions {
  host?: string;
  port?: number;
  timeoutMs?: number;
  maxBytes?: number;
}

const env = {
  host: process.env.CLAMAV_HOST,
  port: Number(process.env.CLAMAV_PORT || '3310'),
  timeoutMs: Number(process.env.CLAMAV_TIMEOUT_MS || '6000'),
  maxBytes: Number(process.env.CLAMAV_MAX_BYTES || String(5 * 1024 * 1024)),
};

export function isConfigured(opts: ClamOptions = {}): boolean {
  const h = opts.host ?? env.host;
  const p = opts.port ?? env.port;
  return Boolean(h && p);
}

export async function scanBuffer(buf: Buffer, opts: ClamOptions = {}): Promise<ScanResult> {
  const host = opts.host ?? env.host;
  const port = opts.port ?? env.port;
  const timeoutMs = opts.timeoutMs ?? env.timeoutMs;
  const maxBytes = opts.maxBytes ?? env.maxBytes;

  if (!host || !port) return { status: 'unavailable' };
  if (buf.byteLength === 0) return { status: 'clean' };
  if (buf.byteLength > maxBytes) return { status: 'error', raw: 'payload_too_large' };

  return new Promise<ScanResult>((resolve) => {
    const socket = new net.Socket();
    let resolved = false;
    const finish = (res: ScanResult) => { if (!resolved) { resolved = true; try { socket.destroy(); } catch {} resolve(res); } };

    const timer = setTimeout(() => finish({ status: 'error', raw: 'timeout' }), timeoutMs);

    socket.once('error', (e) => { clearTimeout(timer); finish({ status: 'error', raw: String(e) }); });
    socket.connect(port, host, () => {
      // INSTREAM protocol: send command, then chunked len (uint32 BE), then data, then 0-len terminator.
      socket.write('zINSTREAM
');
      // Send in chunks to avoid large single buffer on the wire.
      const CHUNK = 64 * 1024;
      for (let i = 0; i < buf.length; i += CHUNK) {
        const chunk = buf.subarray(i, Math.min(i + CHUNK, buf.length));
        const len = Buffer.alloc(4);
        len.writeUInt32BE(chunk.length, 0);
        socket.write(len);
        socket.write(chunk);
      }
      const zero = Buffer.alloc(4); // zero-length to terminate
      socket.write(zero);
    });

    let acc = '';
    socket.on('data', (d) => { acc += d.toString('utf8'); });
    socket.on('close', () => {
      clearTimeout(timer);
      // typical: 'stream: OK' or 'stream: Eicar-Test-Signature FOUND' or 'INSTREAM size limit exceeded. ERROR'
      const raw = acc.trim();
      if (!raw) return finish({ status: 'error', raw: 'no_response' });
      const m = /: (?:(.+) FOUND|OK|(.+ERROR))/i.exec(raw);
      if (!m) return finish({ status: 'error', raw });
      if (m[1]) return finish({ status: 'infected', signature: m[1], raw });
      if (m[2]) return finish({ status: 'error', raw });
      return finish({ status: 'clean', raw });
    });
  });
}

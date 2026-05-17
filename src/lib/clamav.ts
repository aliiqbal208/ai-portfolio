// Minimal ClamAV scanning utilities with clamd (TCP) support and safe fallbacks.
// No external deps. Uses node 'net' for INSTREAM. Fallback detects EICAR in mock mode.

export type ScanResult = {
  ok: boolean;
  engine: 'clamd' | 'mock' | 'disabled';
  infected: boolean;
  signature?: string;
  bytes: number;
  durationMs: number;
  reason?: string;
};

const DEFAULT_MAX_BYTES = Number.parseInt(process.env.CLAMAV_MAX_BYTES || '8388608', 10);
const DEFAULT_TIMEOUT_MS = Number.parseInt(process.env.CLAMAV_TIMEOUT_MS || '8000', 10);

function hasClamdConfig(): boolean {
  return Boolean(process.env.CLAMAV_HOST);
}

function getClamdConfig() {
  return {
    host: process.env.CLAMAV_HOST || '127.0.0.1',
    port: Number.parseInt(process.env.CLAMAV_PORT || '3310', 10),
    timeoutMs: DEFAULT_TIMEOUT_MS,
  };
}

function eicarDetect(buf: Buffer): string | undefined {
  const text = buf.toString('latin1');
  if (text.includes('EICAR-STANDARD-ANTIVIRUS-TEST-FILE')) return 'Eicar-Test-Signature';
  return undefined;
}

async function toBuffer(fileOrArrayBuffer: File | ArrayBuffer): Promise<Buffer> {
  if (typeof (global as any).Buffer === 'undefined') {
    throw new Error('Buffer not available in this runtime; ensure Node.js runtime');
  }
  if (fileOrArrayBuffer instanceof ArrayBuffer) return Buffer.from(fileOrArrayBuffer);
  const ab = await (fileOrArrayBuffer as File).arrayBuffer();
  return Buffer.from(ab);
}

export async function scanBuffer(input: File | ArrayBuffer | Buffer, opts?: { maxBytes?: number; timeoutMs?: number }): Promise<ScanResult> {
  const started = Date.now();
  const maxBytes = opts?.maxBytes ?? DEFAULT_MAX_BYTES;
  const timeoutMs = opts?.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  let buf: Buffer;
  if (Buffer.isBuffer(input)) buf = input as Buffer;
  else buf = await toBuffer(input as any);

  const size = buf.byteLength;
  if (size == 0) {
    return { ok: true, engine: hasClamdConfig() ? 'clamd' : 'mock', infected: false, bytes: 0, durationMs: Date.now() - started };
  }
  if (size > maxBytes) {
    return { ok: false, engine: hasClamdConfig() ? 'clamd' : 'mock', infected: false, bytes: size, durationMs: Date.now() - started, reason: 'oversize ' + String(size) + ' of ' + String(maxBytes) };
  }

  if (hasClamdConfig()) {
    try {
      const res = await scanWithClamd(buf, timeoutMs);
      res.durationMs = Date.now() - started;
      return res;
    } catch (err: any) {
      return { ok: false, engine: 'clamd', infected: false, bytes: size, durationMs: Date.now() - started, reason: err?.message || 'clamd_error' };
    }
  }

  const sig = eicarDetect(buf);
  return {
    ok: true,
    engine: process.env.CLAMAV_MODE === 'disabled' ? 'disabled' : 'mock',
    infected: Boolean(sig),
    signature: sig,
    bytes: size,
    durationMs: Date.now() - started,
  };
}

async function scanWithClamd(buf: Buffer, timeoutMs: number): Promise<ScanResult> {
  const { host, port } = getClamdConfig();
  const net = await import('node:net');

  return await new Promise<ScanResult>((resolve, reject) => {
    const socket = new (net as any).Socket();
    let resolved = false;
    let timer: NodeJS.Timeout | undefined;

    const done = (err?: Error, result?: ScanResult) => {
      if (resolved) return;
      resolved = true;
      try { socket.destroy(); } catch (e) {}
      if (timer) clearTimeout(timer);
      if (err) { reject(err); return; }
      if (result) { resolve(result); return; }
    };

    timer = setTimeout(() => done(new Error('clamd_timeout')), timeoutMs);

    socket.once('error', (e: any) => done(e));
    socket.connect(port, host, () => {
      try {
        const header = Buffer.from('INSTREAM\x00', 'utf8');
        socket.write(header);
        const CHUNK = 8192;
        let offset = 0;
        while (offset < buf.length) {
          const end = Math.min(offset + CHUNK, buf.length);
          const slice = buf.subarray(offset, end);
          const len = Buffer.alloc(4);
          len.writeUInt32BE(slice.length, 0);
          socket.write(len);
          socket.write(slice);
          offset = end;
        }
        const zero = Buffer.alloc(4);
        socket.write(zero);
      } catch (e: any) {
        return done(e);
      }
    });

    let accum = '';
    socket.on('data', (chunk: Buffer) => {
      accum += chunk.toString('utf8');
      if (/\OK\|\FOUND\|\ERROR\/.test(accum)) {
        const text = accum.trim();
        const bytes = buf.byteLength;
        if (text.indexOf('OK') >= 0) return done(undefined, { ok: true, engine: 'clamd', infected: false, bytes, durationMs: 0 });
        if (text.indexOf('FOUND') >= 0) {
          const parts = text.split(':');
          const sig = (parts.length > 1 ? parts[1] : '').replace('FOUND', '').trim() || 'UNKNOWN';
          return done(undefined, { ok: true, engine: 'clamd', infected: true, signature: sig, bytes, durationMs: 0 });
        }
        return done(new Error(text));
      }
    });
  });
}

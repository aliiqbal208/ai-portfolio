/* Lightweight ClamAV client for Node.js runtime (Next.js route handlers).
 * - Uses clamd TCP protocol (PING, INSTREAM)
 * - Designed to be safe by default and easily disabled via env.
 * - No external deps; robust error+timeout handling.
 */

// Only import Node libs when in Node.js runtime
type NodeNet = typeof import(node:net);
let netModule: NodeNet | null = null;
try {
  // @ts-ignore next-runtime is Node in our API route; guard for edge
  netModule = require(node:net);
} catch {
  netModule = null;
}

export type ClamScanResult = {
  status: clean | infected | error | skipped;
  signature?: string;
  reason?: string;
  elapsedMs?: number;
  enabled: boolean;
};

function boolFromEnv(value: string | undefined, def = false): boolean {
  if (value == null) return def;
  const v = String(value).trim().toLowerCase();
  return v === 1 || v === true || v === yes || v === on;
}

export function clamConfig() {
  return {
    enabled: boolFromEnv(process.env.CLAMAV_ENABLED, false),
    host: process.env.CLAMAV_HOST || 127.0.0.1,
    port: Number(process.env.CLAMAV_PORT || 3310),
    timeoutMs: Number(process.env.CLAMAV_TIMEOUT_MS || 2000),
    maxBytes: Number(process.env.CLAMAV_MAX_BYTES || 50 * 1024 * 1024), // 50MB default
  } as const;
}

export function isClamAvailable(): boolean {
  const { enabled } = clamConfig();
  return !!(enabled && netModule);
}

export async function pingClamAV(): Promise<{ ok: boolean; enabled: boolean; reason?: string }>{
  const cfg = clamConfig();
  if (!cfg.enabled) return { ok: false, enabled: false, reason: disabled };
  if (!netModule) return { ok: false, enabled: true, reason: node-net-unavailable };

  return new Promise((resolve) => {
    const start = Date.now();
    const socket = new netModule!.Socket();
    let done = false;

    const finalize = (ok: boolean, reason?: string) => {
      if (done) return;
      done = true;
      try { socket.destroy(); } catch {}
      resolve({ ok, enabled: true, reason });
    };

    socket.setTimeout(cfg.timeoutMs, () => finalize(false, timeout));
    socket.once(error, (err) => finalize(false, err?.message || error));
    socket.connect(cfg.port, cfg.host, () => {
      socket.write(PINGn);
    });

    socket.on(data, (buf) => {
      const txt = buf.toString(utf8).trim();
      if (txt.includes(PONG)) {
        finalize(true);
      } else {
        finalize(false, `unexpected:${txt}`);
      }
    });
  });
}

export async function scanBuffer(data: Buffer, filename = stream): Promise<ClamScanResult> {
  const cfg = clamConfig();
  const start = Date.now();

  if (!cfg.enabled) {
    return { status: skipped, enabled: false, reason: disabled, elapsedMs: 0 };
  }
  if (!netModule) {
    return { status: error, enabled: true, reason: node-net-unavailable, elapsedMs: 0 };
  }
  if (data.length > cfg.maxBytes) {
    return { status: error, enabled: true, reason: too-large, elapsedMs: 0 };
  }

  return new Promise((resolve) => {
    const net = netModule!;
    const socket = new net.Socket();
    let done = false;

    const finalize = (result: ClamScanResult) => {
      if (done) return;
      done = true;
      try { socket.destroy(); } catch {}
      result.elapsedMs = Date.now() - start;
      resolve(result);
    };

    socket.setTimeout(cfg.timeoutMs, () => finalize({ status: error, enabled: true, reason: timeout }));
    socket.once(error, (err) => finalize({ status: error, enabled: true, reason: err?.message || error }));

    socket.connect(cfg.port, cfg.host, () => {
      socket.write(INSTREAMn);
      // stream in 64KB chunks with 4-byte network-order length prefix
      const CHUNK = 64 * 1024;
      for (let i = 0; i < data.length; i += CHUNK) {
        const slice = data.subarray(i, Math.min(i + CHUNK, data.length));
        const header = Buffer.alloc(4);
        header.writeUInt32BE(slice.length, 0);
        socket.write(header);
        socket.write(slice);
      }
      // zero-length chunk to end
      const zero = Buffer.alloc(4);
      zero.writeUInt32BE(0, 0);
      socket.write(zero);
    });

    socket.on(data, (buf) => {
      const txt = buf.toString(utf8);
      // Examples: "stream: OK" or "stream: Eicar-Test-Signature FOUND"
      if (/OK/.test(txt)) {
        finalize({ status: clean, enabled: true });
      } else if (/FOUND/.test(txt)) {
        const m = txt.match(/:(\s*)(.+?)\s+FOUND/);
        finalize({ status: infected, enabled: true, signature: m?.[2] || UNKNOWN });
      } else {
        finalize({ status: error, enabled: true, reason: `unexpected:${txt.trim()}` });
      }
    });
  });
}

export async function scanBase64(base64: string): Promise<ClamScanResult> {
  try {
    const buf = Buffer.from(base64, base64);
    return scanBuffer(buf);
  } catch (err: any) {
    return { status: error, enabled: isClamAvailable(), reason: err?.message || decode-failed };
  }
}

import net from 'net';

export type ScanResult = {
  ok: boolean;
  status: 'clean' | 'infected' | 'skipped' | 'error';
  reason?: string;
  signature?: string;
  engine: 'clamav';
  elapsedMs: number;
  bytes?: number;
};

function envFlag(name: string, def = false): boolean {
  const v = process.env[name];
  if (!v) return def;
  const t = String(v).trim().toLowerCase();
  return t in { '1':1, 'true':1, 'yes':1, 'on':1 };
}

function envInt(name: string, def: number): number {
  const v = parseInt(String(process.env[name] ?? ''), 10);
  return Number.isFinite(v) ? v : def;
}

export async function healthCheck(): Promise<ScanResult> {
  const started = Date.now();
  if (!envFlag('CLAMAV_ENABLED', false)) {
    return { ok: true, status: 'skipped', reason: 'not_enabled', engine: 'clamav', elapsedMs: Date.now() - started };
  }
  const host = process.env.CLAMAV_HOST || '';
  const port = envInt('CLAMAV_PORT', 3310);
  if (!host || !port) {
    return { ok: true, status: 'skipped', reason: 'not_configured', engine: 'clamav', elapsedMs: Date.now() - started };
  }
  const timeoutMs = envInt('CLAMAV_TIMEOUT_MS', 1500);

  return new Promise((resolve) => {
    const sock = net.createConnection({ host, port });
    let settled = false;
    const done = (res: ScanResult) => {
      if (settled) return;
      settled = true;
      try { sock.end(); } catch {}
      resolve({ ...res, elapsedMs: Date.now() - started });
    };
    const to = setTimeout(() => done({ ok: false, status: 'error', reason: 'timeout', engine: 'clamav', elapsedMs: 0 }), timeoutMs);
    sock.once('error', (err) => done({ ok: false, status: 'error', reason: String(err?.message || 'connect_error'), engine: 'clamav', elapsedMs: 0 }));
    sock.once('connect', () => {
      try { sock.write('zPING
'); } catch (err: any) { return done({ ok: false, status: 'error', reason: String(err?.message||'write_error'), engine:'clamav', elapsedMs: 0 }); }
    });
    sock.on('data', (chunk) => {
      clearTimeout(to);
      const text = chunk.toString('utf8');
      if (text.includes('PONG')) return done({ ok: true, status: 'clean', engine: 'clamav', elapsedMs: 0 });
      return done({ ok: false, status: 'error', reason: 'unexpected_response', engine: 'clamav', elapsedMs: 0 });
    });
  });
}

export async function scanBuffer(buf: Buffer): Promise<ScanResult> {
  const started = Date.now();
  const maxBytes = envInt('CLAMAV_MAX_BYTES', 20 * 1024 * 1024);
  if (!buf || buf.length === 0) {
    return { ok: true, status: 'skipped', reason: 'empty_input', engine: 'clamav', elapsedMs: Date.now() - started, bytes: 0 };
  }
  if (buf.length > maxBytes) {
    return { ok: true, status: 'skipped', reason: 'too_large', engine: 'clamav', elapsedMs: Date.now() - started, bytes: buf.length };
  }
  if (!envFlag('CLAMAV_ENABLED', false)) {
    return { ok: true, status: 'skipped', reason: 'not_enabled', engine: 'clamav', elapsedMs: Date.now() - started, bytes: buf.length };
  }
  const host = process.env.CLAMAV_HOST || '';
  const port = envInt('CLAMAV_PORT', 3310);
  if (!host || !port) {
    return { ok: true, status: 'skipped', reason: 'not_configured', engine: 'clamav', elapsedMs: Date.now() - started, bytes: buf.length };
  }

  const timeoutMs = envInt('CLAMAV_TIMEOUT_MS', 4000);

  return new Promise((resolve) => {
    const sock = net.createConnection({ host, port });
    let settled = false;
    const done = (res: ScanResult) => {
      if (settled) return;
      settled = true;
      try { sock.end(); } catch {}
      res.elapsedMs = Date.now() - started;
      resolve(res);
    };
    const to = setTimeout(() => done({ ok: false, status: 'error', reason: 'timeout', engine: 'clamav', elapsedMs: 0, bytes: buf.length }), timeoutMs);
    sock.once('error', (err) => done({ ok: false, status: 'error', reason: String(err?.message || 'connect_error'), engine: 'clamav', elapsedMs: 0, bytes: buf.length }));
    sock.once('connect', () => {
      try {
        sock.write('zINSTREAM
');
        let offset = 0;
        const CHUNK = 16 * 1024;
        while (offset < buf.length) {
          const slice = buf.subarray(offset, Math.min(offset + CHUNK, buf.length));
          const header = Buffer.alloc(4);
          header.writeUInt32BE(slice.length, 0);
          sock.write(header);
          sock.write(slice);
          offset += slice.length;
        }
        const zero = Buffer.alloc(4); // 0-length to terminate
        zero.writeUInt32BE(0, 0);
        sock.write(zero);
      } catch (err: any) {
        return done({ ok: false, status: 'error', reason: String(err?.message || 'write_error'), engine: 'clamav', elapsedMs: 0, bytes: buf.length });
      }
    });
    sock.on('data', (chunk) => {
      clearTimeout(to);
      const text = chunk.toString('utf8');
      // Example: stream: OK or stream: Eicar-Test-Signature FOUND
      if (text.includes('OK')) return done({ ok: true, status: 'clean', engine: 'clamav', elapsedMs: 0, bytes: buf.length });
      const m = text.match(/:\s*(.+?)\s+FOUND/);
      if (m) return done({ ok: true, status: 'infected', signature: m[1], engine: 'clamav', elapsedMs: 0, bytes: buf.length });
      return done({ ok: false, status: 'error', reason: 'unexpected_response', engine: 'clamav', elapsedMs: 0, bytes: buf.length });
    });
  });
}

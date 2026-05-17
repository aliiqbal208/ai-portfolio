import net from 'net';
import { spawn } from 'child_process';

export type ScanStatus = 'CLEAN' | 'INFECTED' | 'ERROR' | 'UNAVAILABLE';

export interface ScanResult {
  engine: 'clamd' | 'clamscan' | 'none';
  status: ScanStatus;
  signature?: string;
  raw?: string;
  durationMs?: number;
}

export interface ClamOptions {
  host?: string;
  port?: number;
  timeoutMs?: number;
  chunkSize?: number;
  clamscanPath?: string;
}

const DEFAULTS: Required<Pick<ClamOptions, 'host' | 'port' | 'timeoutMs' | 'chunkSize'>> = {
  host: process.env.CLAMAV_HOST || '127.0.0.1',
  port: Number(process.env.CLAMAV_PORT || 3310),
  timeoutMs: Number(process.env.CLAMAV_TIMEOUT_MS || 8000),
  chunkSize: 64 * 1024,
};

export async function pingClamd(opts: ClamOptions = {}): Promise<boolean> {
  const host = opts.host ?? DEFAULTS.host;
  const port = opts.port ?? DEFAULTS.port;
  const timeoutMs = opts.timeoutMs ?? DEFAULTS.timeoutMs;
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let done = false;
    const finish = (ok: boolean) => {
      if (done) return;
      done = true;
      try { socket.destroy(); } catch {}
      resolve(ok);
    };
    socket.setTimeout(timeoutMs, () => finish(false));
    socket.once('error', () => finish(false));
    socket.connect(port, host, () => {
      socket.write('PING\n');
    });
    socket.once('data', (buf) => {
      const txt = buf.toString('utf8').trim();
      finish(txt === 'PONG');
    });
  });
}

export async function scanBuffer(
  input: Buffer,
  options: ClamOptions = {}
): Promise<ScanResult> {
  const start = Date.now();
  try {
    const res = await scanViaClamd(input, options);
    if (res) {
      res.durationMs = Date.now() - start;
      return res;
    }
  } catch {}
  try {
    const res = await scanViaClamscan(input, options);
    if (res) {
      res.durationMs = Date.now() - start;
      return res;
    }
  } catch {}
  return { engine: 'none', status: 'UNAVAILABLE', durationMs: Date.now() - start };
}

async function scanViaClamd(
  input: Buffer,
  opts: ClamOptions
): Promise<ScanResult | null> {
  const host = opts.host ?? DEFAULTS.host;
  const port = opts.port ?? DEFAULTS.port;
  const timeoutMs = opts.timeoutMs ?? DEFAULTS.timeoutMs;
  const chunkSize = opts.chunkSize ?? DEFAULTS.chunkSize;
  const pong = await pingClamd({ host, port, timeoutMs });
  if (!pong) return null;
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      try { socket.destroy(); } catch {}
      resolve({ engine: 'clamd', status: 'ERROR', raw: 'timeout' });
    }, timeoutMs);
    const finish = (result: ScanResult) => {
      clearTimeout(timer);
      try { socket.destroy(); } catch {}
      resolve(result);
    };
    socket.once('error', (e) => { if (!timedOut) finish({ engine: 'clamd', status: 'ERROR', raw: String(e) }); });
    socket.connect(port, host, () => {
      socket.write('INSTREAM\n');
      let offset = 0;
      while (offset < input.length) {
        const end = Math.min(offset + chunkSize, input.length);
        const chunk = input.subarray(offset, end);
        const lenBuf = Buffer.alloc(4);
        lenBuf.writeUInt32BE(chunk.length, 0);
        socket.write(lenBuf);
        socket.write(chunk);
        offset = end;
      }
      const zero = Buffer.alloc(4);
      zero.writeUInt32BE(0, 0);
      socket.write(zero);
    });
    socket.on('data', (buf) => {
      const txt = buf.toString('utf8').trim();
      let status: ScanStatus = 'ERROR';
      let signature: string | undefined;
      if (/\bOK\b/i.test(txt)) status = 'CLEAN';
      else if (/\bFOUND\b/i.test(txt)) {
        status = 'INFECTED';
        const m = txt.match(/stream:\s*(.*)\s*FOUND/i);
        if (m) signature = m[1].trim();
      } else if (/\bERROR\b/i.test(txt)) status = 'ERROR';
      finish({ engine: 'clamd', status, signature, raw: txt });
    });
  });
}

async function scanViaClamscan(
  input: Buffer,
  opts: ClamOptions
): Promise<ScanResult | null> {
  const bin = opts.clamscanPath || process.env.CLAMSCAN_PATH || 'clamscan';
  return new Promise((resolve) => {
    const child = spawn(bin, ['--no-summary', '-'], { stdio: ['pipe', 'pipe', 'pipe'] });
    let out = '';
    let err = '';
    let resolved = false;
    const finish = (res: ScanResult | null) => { if (resolved) return; resolved = true; try { child.kill(); } catch {}; resolve(res); };
    child.on('error', () => finish(null));
    child.stdout.on('data', (d) => (out += d.toString('utf8')));
    child.stderr.on('data', (d) => (err += d.toString('utf8')));
    child.on('close', () => {
      const txt = (out || err).trim();
      if (!txt) return finish(null);
      let status: ScanStatus = 'ERROR';
      let signature: string | undefined;
      if (/\bOK\b/i.test(txt)) status = 'CLEAN';
      else if (/\bFOUND\b/i.test(txt)) {
        status = 'INFECTED';
        const m = txt.match(/:\s*(.*)\s*FOUND/i);
        if (m) signature = m[1].trim();
      }
      finish({ engine: 'clamscan', status, signature, raw: txt });
    });
    child.stdin.write(input);
    child.stdin.end();
  });
}

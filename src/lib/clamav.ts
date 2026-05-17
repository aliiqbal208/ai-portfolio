import net from 'net';

export type ClamAVConfig = {
  host?: string;
  port?: number;
  timeoutMs?: number;
};

export type ClamAVHealth = {
  configured: boolean;
  status: 'disabled' | 'ready' | 'unavailable';
  version?: string;
  latencyMs?: number;
};

function getConfig(): Required<ClamAVConfig> {
  const host = process.env.CLAMAV_HOST || '';
  const port = Number(process.env.CLAMAV_PORT || 3310);
  const timeoutMs = Number(process.env.CLAMAV_TIMEOUT_MS || 1500);
  return { host, port, timeoutMs } as Required<ClamAVConfig>;
}

function connect(cfg: Required<ClamAVConfig>): Promise<net.Socket> {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ host: cfg.host, port: cfg.port });
    const onError = (err: Error) => {
      cleanup();
      reject(err);
    };
    const onConnect = () => {
      socket.setTimeout(cfg.timeoutMs);
      cleanup();
      resolve(socket);
    };
    const cleanup = () => {
      socket.removeListener('error', onError);
      socket.removeListener('connect', onConnect);
    };
    socket.once('error', onError);
    socket.once('connect', onConnect);
  });
}

async function sendCommand(cmd: string, cfg: Required<ClamAVConfig>): Promise<string> {
  const socket = await connect(cfg);
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const onData = (data: Buffer) => chunks.push(data);
    const onEnd = () => resolve(Buffer.concat(chunks).toString('utf8').trim());
    const onTimeout = () => {
      socket.destroy(new Error('timeout'));
      reject(new Error('timeout'));
    };
    const onError = (err: Error) => reject(err);
    socket.once('timeout', onTimeout);
    socket.once('error', onError);
    socket.on('data', onData);
    socket.once('end', onEnd);
    socket.write(cmd + '
');
  });
}

export async function health(): Promise<ClamAVHealth> {
  const cfg = getConfig();
  if (!cfg.host) {
    return { configured: false, status: 'disabled' };
  }
  const t0 = Date.now();
  try {
    const pong = await sendCommand('PING', cfg);
    if (!pong.toUpperCase().includes('PONG')) {
      return { configured: true, status: 'unavailable' };
    }
    let version = '';
    try {
      version = await sendCommand('VERSION', cfg);
    } catch {}
    return { configured: true, status: 'ready', version, latencyMs: Date.now() - t0 };
  } catch {
    return { configured: true, status: 'unavailable' };
  }
}

export type ScanResult = {
  ok: boolean;
  reason?: string;
  signature?: string;
};

/**
 * Stream a buffer to clamd using the INSTREAM protocol.
 * NOTE: When CLAMAV_HOST is unset, this returns ok=true with reason='disabled'.
 */
export async function scanBuffer(data: Buffer): Promise<ScanResult> {
  const cfg = getConfig();
  if (!cfg.host) return { ok: true, reason: 'disabled' };
  const socket = await connect(cfg);
  return new Promise((resolve, reject) => {
    const onError = (err: Error) => reject(err);
    const onTimeout = () => reject(new Error('timeout'));
    const onData = (chunk: Buffer) => {
      const text = chunk.toString('utf8');
      const line = text.trim();
      if (/OK/i.test(line)) {
        cleanup();
        resolve({ ok: true });
      } else if (/FOUND/i.test(line)) {
        const m = line.match(/: (.*) FOUND/i);
        cleanup();
        resolve({ ok: false, signature: m?.[1] || 'FOUND' });
      }
    };
    const cleanup = () => {
      socket.removeListener('error', onError);
      socket.removeListener('timeout', onTimeout);
      socket.removeListener('data', onData);
      try { socket.end(); } catch {}
    };

    socket.once('error', onError);
    socket.once('timeout', onTimeout);
    socket.on('data', onData);

    socket.write('INSTREAM
');
    const MAX = 1024 * 1024;
    let offset = 0;
    while (offset < data.length) {
      const n = Math.min(MAX, data.length - offset);
      const sizeBuf = Buffer.alloc(4);
      sizeBuf.writeUInt32BE(n, 0);
      socket.write(sizeBuf);
      socket.write(data.subarray(offset, offset + n));
      offset += n;
    }
    const zero = Buffer.alloc(4);
    zero.writeUInt32BE(0, 0);
    socket.write(zero);
  });
}

import { createConnection } from 'node:net';

export type ClamAVHealth = {
  enabled: boolean;
  reachable: boolean;
  version?: string;
  error?: string;
};

function getConfig() {
  const host = process.env.CLAMAV_HOST || '';
  const port = Number(process.env.CLAMAV_PORT || 3310);
  const timeoutMs = Number(process.env.CLAMAV_TIMEOUT_MS || 1000);
  return { host, port, timeoutMs } as const;
}

export function isEnabled(): boolean {
  return !!process.env.CLAMAV_HOST;
}

function sendCommand(cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const { host, port, timeoutMs } = getConfig();
    const socket = createConnection({ host, port });
    let data = '';
    let settled = false;

    const finish = (err: Error | null, result = '') => {
      if (settled) return;
      settled = true;
      try { socket.end(); } catch {}
      if (err) return reject(err);
      resolve(result);
    };

    socket.setTimeout(timeoutMs, () => finish(new Error('timeout')));

    socket.on('connect', () => {
      socket.write(cmd.endsWith('
') ? cmd : cmd + '
');
    });
    socket.on('data', (chunk) => { data += chunk.toString('utf8'); });
    socket.on('end', () => finish(null, data.trim()));
    socket.on('error', (err) => finish(err as any));
  });
}

export async function health(): Promise<ClamAVHealth> {
  if (!isEnabled()) {
    return { enabled: false, reachable: false };
  }
  try {
    const pong = await sendCommand('PING');
    const reachable = /PONG/i.test(pong);
    let version: string | undefined = undefined;
    if (reachable) {
      try {
        const v = await sendCommand('VERSION');
        version = v.replace(/\s+/g, ' ').trim();
      } catch {
        // ignore version errors
      }
    }
    return { enabled: true, reachable, version };
  } catch (e: any) {
    const msg = (e && (e.message ?? String(e))) || 'unknown error';
    return { enabled: true, reachable: false, error: msg };
  }
}

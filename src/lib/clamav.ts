import net from 'net';

export type ClamAVHealth = {
  configured: boolean;
  reachable: boolean;
  host?: string;
  port?: number;
  latencyMs?: number;
  version?: string;
  reason?: string;
};

function getConfig() {
  const host = process.env.CLAMAV_HOST || '127.0.0.1';
  const port = Number(process.env.CLAMAV_PORT || 3310);
  const enabled = String(process.env.CLAMAV_ENABLED || '').trim().toLowerCase();
  const configured = enabled === '1' || enabled === 'true' || enabled === 'yes';
  return { host, port, configured };
}

export async function pingClamAV(timeoutMs = 1000): Promise<ClamAVHealth> {
  const { host, port, configured } = getConfig();
  if (!configured) {
    return { configured: false, reachable: false, reason: 'not_enabled' };
  }

  const start = Date.now();
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let finished = false;

    const finish = (data?: Buffer, reason?: string) => {
      if (finished) return;
      finished = true;
      try { socket.destroy(); } catch { /* noop */ }
      const body = (data || Buffer.alloc(0)).toString('utf8').trim();
      const ok = body.includes('PONG');
      resolve({
        configured,
        reachable: ok,
        host,
        port,
        latencyMs: Date.now() - start,
        reason: ok ? undefined : (reason || body || 'unexpected_response'),
      });
    };

    socket.setTimeout(timeoutMs, () => finish(undefined, 'timeout'));
    socket.once('error', (err) => finish(undefined, err?.message || 'error'));
    socket.connect(port, host, () => {
      try {
        socket.write('PING
');
      } catch (err: any) {
        finish(undefined, err?.message || 'write_failed');
      }
    });
    socket.once('data', (data) => finish(data));
  });
}

export async function versionClamAV(timeoutMs = 1000): Promise<string | undefined> {
  const { host, port, configured } = getConfig();
  if (!configured) return undefined;
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let done = false;
    const finish = (data?: Buffer) => {
      if (done) return;
      done = true;
      try { socket.destroy(); } catch { /* noop */ }
      resolve((data || Buffer.alloc(0)).toString('utf8').trim() || undefined);
    };
    socket.setTimeout(timeoutMs, () => finish());
    socket.once('error', () => finish());
    socket.connect(port, host, () => {
      try { socket.write('VERSION
'); } catch { finish(); }
    });
    socket.once('data', (data) => finish(data));
  });
}

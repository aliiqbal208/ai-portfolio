import net from 'node:net';

export type ClamdConfig = {
  host: string;
  port: number;
  timeoutMs: number;
};

export function getClamdConfig(): { configured: boolean; config?: ClamdConfig } {
  const host = process.env.CLAMD_HOST || process.env.CLAMAV_HOST || '';
  const portTxt = process.env.CLAMD_PORT || process.env.CLAMAV_PORT || '';
  if (!host || !portTxt) return { configured: false };
  const port = Number(portTxt);
  const timeoutMs = Number(process.env.CLAMD_TIMEOUT_MS || 1500);
  if (!Number.isFinite(port) || port <= 0) return { configured: false };
  return { configured: true, config: { host, port, timeoutMs } };
}

export async function clamdPing(cfg: ClamdConfig): Promise<{ ok: boolean; reachable: boolean; pong?: boolean; error?: string }>{
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: cfg.host, port: cfg.port });
    let settled = false;
    const finish = (value: any) => {
      if (!settled) {
        settled = true;
        try { socket.destroy(); } catch {}
        resolve(value);
      }
    };

    const timer = setTimeout(() => {
      finish({ ok: true, reachable: false, error: 'timeout' });
    }, cfg.timeoutMs);

    socket.on('connect', () => {
      try {
        socket.write('PING\n');
      } catch (err: any) {
        clearTimeout(timer);
        finish({ ok: true, reachable: false, error: err?.message || 'write_failed' });
      }
    });

    socket.on('data', (chunk) => {
      clearTimeout(timer);
      const text = chunk.toString('utf8');
      const pong = text.includes('PONG');
      finish({ ok: true, reachable: true, pong });
    });

    socket.on('error', (err) => {
      clearTimeout(timer);
      finish({ ok: true, reachable: false, error: (err as any)?.message || 'error' });
    });

    socket.on('end', () => {
      clearTimeout(timer);
      finish({ ok: true, reachable: true, pong: false });
    });
  });
}

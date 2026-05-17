// Minimal, production-safe ClamAV utilities with graceful fallbacks.
// No external deps; avoids secrets and handles timeouts reliably.

import fs from 'node:fs';
import net from 'node:net';

export type AvMode = 'disabled' | 'clamd-tcp' | 'clamd-unix' | 'clamscan';

function bool(value: string | undefined, def = false): boolean {
  if (!value) return def;
  const t = value.trim().toLowerCase();
  return t == '1' || t == 'true' || t == 'yes' || t == 'on';
}

export function resolveMode(): AvMode {
  const enabled = bool(process.env.CLAMAV_ENABLED, false);
  if (!enabled) return 'disabled';

  const socketPath = (process.env.CLAMAV_SOCKET_PATH || '').trim();
  const host = (process.env.CLAMAV_HOST || '').trim();
  const port = parseInt(process.env.CLAMAV_PORT || '3310', 10) || 3310;
  const clamscanPath = (process.env.CLAMSCAN_PATH || '/usr/bin/clamscan').trim();

  if (socketPath && fs.existsSync(socketPath)) return 'clamd-unix';
  if (host && port > 0) return 'clamd-tcp';
  if (fs.existsSync(clamscanPath)) return 'clamscan';
  return 'disabled';
}

export async function pingClamd(mode: AvMode): Promise<{ ok: boolean; error?: string }>{
  if (mode !== 'clamd-tcp' && mode !== 'clamd-unix') return { ok: false, error: 'not-clamd' };
  const timeoutMs = Math.max(1000, parseInt(process.env.CLAMAV_TIMEOUT_MS || '5000', 10) || 5000);

  return new Promise((resolve) => {
    try {
      const socket = mode === 'clamd-unix'
        ? net.createConnection({ path: (process.env.CLAMAV_SOCKET_PATH || '').trim() })
        : net.createConnection({ host: (process.env.CLAMAV_HOST || '').trim(), port: parseInt(process.env.CLAMAV_PORT || '3310', 10) || 3310 });

      let settled = false;
      const finish = (ok: boolean, error?: string) => {
        if (settled) return; settled = true;
        try { socket.destroy(); } catch {}
        resolve({ ok, error });
      };

      socket.setTimeout(timeoutMs, () => finish(false, 'timeout'));
      socket.once('error', (err) => finish(false, (err as any)?.message || 'socket-error'));

      socket.once('connect', () => {
        try { socket.write('PING\n'); } catch (e: any) { return finish(false, e?.message || 'write-failed'); }
      });

      let buf = '';
      socket.on('data', (chunk) => {
        buf += chunk.toString('utf8');
        if (buf.includes('PONG')) finish(true);
      });

      socket.once('end', () => {
        if (!settled) finish(buf.includes('PONG'));
      });
    } catch (err: any) {
      resolve({ ok: false, error: err?.message || 'exception' });
    }
  });
}

export function clamscanPath(): string | null {
  const p = (process.env.CLAMSCAN_PATH || '/usr/bin/clamscan').trim();
  return fs.existsSync(p) ? p : null;
}

export function currentEngine(): { mode: AvMode; details: Record<string, unknown> } {
  const mode = resolveMode();
  const details: Record<string, unknown> = {};
  if (mode === 'clamd-unix') {
    details['socketPath'] = (process.env.CLAMAV_SOCKET_PATH || '').trim() ? 'configured' : 'missing';
  } else if (mode === 'clamd-tcp') {
    details['host'] = (process.env.CLAMAV_HOST || '').trim() ? 'configured' : 'missing';
    details['port'] = parseInt(process.env.CLAMAV_PORT || '3310', 10) || 3310;
  } else if (mode === 'clamscan') {
    details['binary'] = clamscanPath() ? 'present' : 'missing';
  }
  return { mode, details };
}

import type { NextRequest } from 'next/server';
import net from 'node:net';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest) {
  const host = process.env.CLAMAV_HOST as string | undefined;
  const port = Number(process.env.CLAMAV_PORT || '0');
  if (!host || !port) {
    return Response.json({ enabled: false, reachable: false, message: 'ClamAV not configured' }, { status: 200 });
  }
  const reachable = await new Promise<boolean>((resolve) => {
    try {
      const socket = new net.Socket();
      const finish = (ok: boolean) => { try { socket.destroy(); } catch {} ; resolve(ok); };
      socket.setTimeout(1000);
      socket.once('error', () => finish(false));
      socket.once('timeout', () => finish(false));
      socket.connect(port, host, () => finish(true));
    } catch {
      resolve(false);
    }
  });
  return Response.json({ enabled: true, reachable }, { status: 200 });
}

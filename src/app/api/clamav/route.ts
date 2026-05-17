export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import net from 'node:net';

function envBool(name: string, def: boolean): boolean {
  const v = process.env[name];
  if (v == null) return def;
  return ['1','true','yes','on'].includes(v.toLowerCase());
}

async function pingClamAV(host: string, port: number, timeoutMs: number): Promise<{ ok: boolean; raw?: string; error?: string }>{
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let done = false;
    const finish = (res: { ok: boolean; raw?: string; error?: string }) => {
      if (done) return; done = true; resolve(res);
    };

    const timer = setTimeout(() => {
      try { socket.destroy(new Error('timeout')); } catch {}
      finish({ ok: false, error: 'timeout' });
    }, timeoutMs);

    socket.on('error', (err) => {
      clearTimeout(timer);
      finish({ ok: false, error: (err as any)?.message || String(err) });
    });
    socket.on('data', (buf) => {
      clearTimeout(timer);
      const raw = buf.toString('utf8').trim();
      finish({ ok: raw.toUpperCase().includes('PONG'), raw });
      try { socket.end(); } catch {}
    });
    socket.on('close', () => {
      clearTimeout(timer);
    });

    try {
      socket.connect({ host, port }, () => {
        try { socket.write('PING
'); } catch (err: any) { finish({ ok: false, error: err?.message || String(err) }); }
      });
    } catch (err: any) {
      clearTimeout(timer);
      finish({ ok: false, error: err?.message || String(err) });
    }
  });
}

export async function GET() {
  const enabled = envBool('ENABLE_CLAMAV', true);
  const host = process.env.CLAMAV_HOST || '127.0.0.1';
  const port = Number(process.env.CLAMAV_PORT || 3310);
  const timeoutMs = Number(process.env.CLAMAV_TIMEOUT_MS || 1500);

  if (!enabled) {
    return Response.json({ status: 'disabled' });
  }

  try {
    const res = await pingClamAV(host, port, timeoutMs);
    if (res.ok) {
      return Response.json({ status: 'ok', raw: res.raw || 'PONG' });
    }
    return Response.json({ status: 'unavailable', error: res.error || 'no-response' });
  } catch (err: any) {
    return Response.json({ status: 'error', error: err?.message || String(err) });
  }
}

export async function POST() {
  const enabled = envBool('ENABLE_CLAMAV', true);
  if (!enabled) return Response.json({ status: 'disabled' });
  return Response.json({ status: 'not-implemented' }, { status: 501 });
}

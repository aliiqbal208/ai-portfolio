import { NextRequest } from 'next/server';
import { scanBytes } from '@/lib/clamav';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function parseMaxBytes(url: URL): number | undefined {
  const v = url.searchParams.get('maxBytes');
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : undefined;
}

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const maxBytes = parseMaxBytes(url);

    const ctype = req.headers.get('content-type') || '';
    let data: Uint8Array | ArrayBuffer;

    if (ctype.startsWith('application/json')) {
      const body = await req.json();
      if (typeof body?.data === 'string') {
        data = Uint8Array.from(Buffer.from(body.data, 'base64'));
      } else if (typeof body?.text === 'string') {
        data = new TextEncoder().encode(body.text);
      } else {
        return Response.json({ error: 'missing data/text field' }, { status: 400 });
      }
    } else {
      // Treat as raw bytes
      data = await req.arrayBuffer();
    }

    const result = await scanBytes(data, { maxBytes });
    return Response.json(result, { status: 200 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ error: msg }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ ok: true, endpoint: 'clamav-scan', note: 'POST bytes or {data: base64} / {text}', signature: 'EICAR-TEST', limits: { defaultMaxBytes: 10 * 1024 * 1024 } });
}

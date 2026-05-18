import { NextRequest } from 'next/server';
import { scanBuffer, scanText } from '../../../lib/clamav';

export const runtime = 'nodejs';
export const maxDuration = 30;

function json(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      ...(init?.headers || {}),
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const ct = req.headers.get('content-type') || '';
    if (!ct.includes('application/json')) {
      return json({ ok: false, error: 'Unsupported content-type' }, { status: 415 });
    }
    const body = await req.json().catch(() => ({} as any));
    const text = String((body as any).text ?? (body as any).content ?? '');
    const base64 = String((body as any).base64 ?? '');
    let result;
    if (base64) {
      const buf = Buffer.from(base64, 'base64');
      result = await scanBuffer(buf);
    } else {
      result = await scanText(text);
    }
    return json({ ok: true, ...result });
  } catch (err: any) {
    return json({ ok: false, error: String(err?.message || err) }, { status: 500 });
  }
}

export async function GET() { return json({ ok: true, endpoint: 'scan' }); }

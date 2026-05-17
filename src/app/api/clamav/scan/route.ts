import { NextRequest } from 'next/server';
import { isEnabled, ping, scanBuffer } from '@/lib/security/clamav';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const contentType = req.headers.get('content-type') || '';
  let body: any = {};
  if (contentType.includes('application/json')) {
    try { body = await req.json(); } catch { body = {}; }
  }

  const mode = String((body && body.mode) || 'scan');
  if (!isEnabled()) {
    if (mode === 'ping') {
      return new Response(JSON.stringify({ ok: false, status: 'disabled' }), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    return new Response(JSON.stringify({ ok: false, status: 'disabled' }), { status: 501, headers: { 'content-type': 'application/json' } });
  }

  if (mode === 'ping') {
    const res = await ping();
    return new Response(JSON.stringify(res), { status: 200, headers: { 'content-type': 'application/json' } });
  }

  const base64 = body && (body.base64 as string | undefined);
  const text = body && (body.text as string | undefined);
  const bytes: Buffer = base64 ? Buffer.from(base64, 'base64') : Buffer.from(text || '', 'utf-8');
  const result = await scanBuffer(bytes);
  return new Response(JSON.stringify(result), { status: 200, headers: { 'content-type': 'application/json' } });
}

export async function GET() {
  return new Response(JSON.stringify({ service: 'clamav', enabled: isEnabled() }), { status: 200, headers: { 'content-type': 'application/json' } });
}


export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { clamavConfigured, scanBufferWithClamAV } from '@/lib/clamav';
function json(data: unknown, status = 200): Response { return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8' } }); }
export async function POST(req: NextRequest): Promise<Response> {
  try {
    if (!clamavConfigured()) return json({ status: 'SKIPPED', reason: 'clamav:not_configured' }, 501);
    const ab = await req.arrayBuffer();
    const buf = Buffer.from(ab);
    if (!buf.length) return json({ status: 'ERROR', reason: 'no_input' }, 400);
    const r = await scanBufferWithClamAV(buf);
    if (r.status === 'INFECTED') return json(r, 409);
    if (r.status === 'ERROR') return json(r, 502);
    return json(r, 200);
  } catch (e: any) {
    return json({ status: 'ERROR', reason: String(e?.message || e) }, 500);
  }
}
export const GET = async () => new Response('Use POST with file body', { status: 405 });

export const runtime = 'nodejs';
import { NextRequest } from 'next/server';
import { scanBuffer } from '@/lib/clamav';

export async function POST(req: NextRequest) {
  try {
    const ctype = req.headers.get('content-type') || '';
    let buf: Buffer | null = null;

    if (ctype.includes('application/json')) {
      const body = await req.json().catch(() => ({} as any));
      const data: string = (body as any)?.data || '';
      const enc: string = (body as any)?.encoding || 'utf8';
      buf = enc === 'base64' ? Buffer.from(data || '', 'base64') : Buffer.from(data || '', 'utf8');
    } else {
      const ab = await req.arrayBuffer();
      buf = Buffer.from(ab);
    }

    const result = await scanBuffer(buf!, {});
    return new Response(JSON.stringify({ ok: true, ...result }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}

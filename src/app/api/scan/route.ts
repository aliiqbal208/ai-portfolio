import { NextRequest, NextResponse } from 'next/server';
import { scanBuffer } from '@/lib/clamav';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json({ error: 'unsupported_content_type' }, { status: 415 });
    }
    const body = await req.json();
    const data = typeof (body as any)?.data === 'string' ? (body as any).data : '';
    const maxBytes = Number(process.env.CLAMAV_MAX_BYTES || 5 * 1024 * 1024);
    if (!data) {
      return NextResponse.json({ error: 'missing_data' }, { status: 400 });
    }
    let buf: Buffer;
    try {
      buf = Buffer.from(data, 'base64');
    } catch {
      return NextResponse.json({ error: 'invalid_base64' }, { status: 400 });
    }
    if (buf.byteLength > maxBytes) {
      return NextResponse.json({ error: 'too_large' }, { status: 413 });
    }
    const result = await scanBuffer(buf, { maxBytes });
    return NextResponse.json({ ok: true, result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'unknown_error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

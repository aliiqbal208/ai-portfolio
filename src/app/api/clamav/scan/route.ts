import { NextRequest, NextResponse } from 'next/server';
import { scanBuffer } from '@/lib/clamav';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    if (!/application\/octet-stream|text\//i.test(contentType)) {
      return NextResponse.json({ ok: false, error: 'unsupported_content_type' }, { status: 400 });
    }
    const buf = Buffer.from(await req.arrayBuffer());
    if (!buf.length) {
      return NextResponse.json({ ok: false, error: 'empty_body' }, { status: 400 });
    }
    const result = await scanBuffer(buf);
    return NextResponse.json({ ok: true, result });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

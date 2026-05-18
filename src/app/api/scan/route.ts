
import { NextRequest, NextResponse } from 'next/server';
import { scanBuffer, type ScanResult } from '@/lib/clamav';

export const runtime = 'nodejs';
export const maxDuration = 30;

function bad(msg: string, code = 400) {
  return NextResponse.json({ error: msg }, { status: code });
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let buf: Buffer | null = null;
    if (contentType.includes('application/json')) {
      const body = await req.json();
      const b64: string | undefined = (body as any)?.content;
      if (!b64) return bad('Missing content (base64)');
      try { buf = Buffer.from(b64, 'base64'); } catch { return bad('Invalid base64'); }
    } else if (contentType.startsWith('multipart/form-data')) {
      const form = await req.formData();
      const file = form.get('file') as File | null;
      if (!file) return bad('Missing file');
      const array = await file.arrayBuffer();
      buf = Buffer.from(array);
    } else {
      return bad('Unsupported content-type');
    }

    if (!buf) return bad('No data');
    const MAX = Number(process.env.CLAM_MAX_BYTES || 5_000_000);
    if (buf.length > MAX) return bad('Payload too large', 413);

    const result: ScanResult = await scanBuffer(buf);
    return NextResponse.json({ ok: true, result: result }, { status: 200 });
  } catch (err) {
    return bad('Unexpected error', 500);
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'stream';
import { scanWithClamAV } from '@/lib/clamav';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get('file');
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'file field required' }, { status: 400 });
    }
    const webStream = (file as File).stream();
    // @ts-ignore Node18+ provides Readable.fromWeb
    const nodeStream: Readable = Readable.fromWeb(webStream as any);
    const result = await scanWithClamAV(nodeStream);

    const httpStatus = result.status === 'infected' ? 422 : 200;
    return NextResponse.json({ ok: true, result }, { status: httpStatus });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'scan_failed' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, info: 'POST multipart/form-data with field \u0027file\u0027' });
}

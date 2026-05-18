import { NextRequest, NextResponse } from 'next/server';
import clamav from '@/lib/clamav';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const dataBase64: string | undefined = body?.dataBase64;
    if (!dataBase64) {
      return NextResponse.json({ ok: false, error: 'missing dataBase64' }, { status: 400 });
    }
    const buffer = Buffer.from(dataBase64, 'base64');
    const result = await clamav.scanBuffer(buffer);
    return NextResponse.json({ ok: true, result });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'unexpected_error' }, { status: 500 });
  }
}

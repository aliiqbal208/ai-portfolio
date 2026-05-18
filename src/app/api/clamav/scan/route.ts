import { NextResponse } from 'next/server';
import { scanString } from '@/lib/clamav';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const data = typeof body?.data === 'string' ? body.data : '';
    if (!data) {
      return NextResponse.json({ error: 'missing data' }, { status: 400 });
    }
    const result = await scanString(data);
    return NextResponse.json({ ok: true, result });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 200 });
  }
}

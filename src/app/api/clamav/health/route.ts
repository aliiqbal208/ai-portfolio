import { NextResponse } from 'next/server';
import { pingClamd } from '@/lib/clamav';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const ping = await pingClamd();
    return NextResponse.json({ ok: true, ping });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

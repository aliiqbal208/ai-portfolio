import { NextResponse } from 'next/server';
import { detectClamAV } from '@/lib/clamav';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const det = await detectClamAV();
    return NextResponse.json({
      ok: true,
      available: det.available,
      engine: det.engine,
      version: det.version,
      error: det.error || null,
      ts: Date.now(),
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err?.message || err) }, { status: 500 });
  }
}

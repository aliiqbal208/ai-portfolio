export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { detectClamAV } from '@/lib/clamav';

export async function GET() {
  try {
    const det = await detectClamAV();
    return NextResponse.json({
      ok: true,
      engine: det.engine,
      ready: det.ready,
      reason: det.reason || null,
      node: process.version,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'error' }, { status: 500 });
  }
}

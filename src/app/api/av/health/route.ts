import { NextResponse } from 'next/server';
import { currentEngine, pingClamd } from '@/lib/clamav';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const { mode, details } = currentEngine();
  if (mode === 'disabled') {
    return NextResponse.json({ status: 'disabled', mode, details });
  }
  if (mode === 'clamd-tcp' || mode === 'clamd-unix') {
    const { ok, error } = await pingClamd(mode);
    return NextResponse.json({ status: ok ? 'ready' : 'degraded', mode, details, error: ok ? undefined : error });
  }
  return NextResponse.json({ status: 'ready', mode, details });
}

import { NextResponse } from 'next/server';
import { isEngineAvailable } from '@/lib/clamav';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const engines = await isEngineAvailable();
    const available = engines.clamd || engines.clamscan;
    return NextResponse.json({ available, engines });
  } catch (e) {
    return NextResponse.json({ available: false, error: String(e) }, { status: 200 });
  }
}

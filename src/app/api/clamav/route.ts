import { NextResponse } from 'next/server';
import { getClamAVHealth } from '@/lib/clamav';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const health = await getClamAVHealth();
    return NextResponse.json(health, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ available: false, error: String(err) }, { status: 200 });
  }
}

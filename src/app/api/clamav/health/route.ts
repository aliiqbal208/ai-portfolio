import { NextResponse } from 'next/server';
import { health as clamHealth } from '@/lib/clamav';

export const runtime = 'nodejs';

export async function GET() {
  const info = await clamHealth();
  return NextResponse.json(info, { status: 200 });
}

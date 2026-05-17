import { NextResponse } from 'next/server';
import { currentClamStatus } from '@/lib/clamav';

export async function GET() {
  const status = currentClamStatus();
  return NextResponse.json(status, { status: 200 });
}

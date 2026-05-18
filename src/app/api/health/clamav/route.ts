import { NextResponse } from 'next/server';
import { health } from '@/lib/clamav';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(){ const info = health(); return NextResponse.json({ ok: true, strategy: info.strategy, available: info.available, details: info.details }); }
